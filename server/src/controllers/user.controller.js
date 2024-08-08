import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplooadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";

//resuable code for watch history

// current user related controllers

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  //get user details from frontend
  // validation - not empty
  // check if user already exists (username,email)
  // check for images ,check for avatar
  //upload them to cloudinary, avatar  (take url)
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return resjj

  const { fullname, email, username, password } = req.body;
  console.log(email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  // console.log(req.files);

  const avatarLocalpath = req.files?.avatar[0]?.path;
  //   const coverImageLocalpath = req.files?.coverImage[0]?.path;

  let coverImageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalpath = req.files.coverImage[0].path;
  }

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uplooadCloudinary(avatarLocalpath);
  const coverImage = await uplooadCloudinary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered successfully"));

  // res.status(200).json({
  //   message: "ok",
  // });
});

const loginUser = asyncHandler(async (req, res) => {
  // console.log(req.cookie)
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  console.log(email, username, password);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const accessoptions = {
    httpOnly: true,
    // secure:true,
    maxAge: 1000 * 60 * 60 * 24,
  };

  const refreshoptions = {
    httpOnly: true,
    // secure:true,
    maxAge: 1000 * 60 * 60 * 24 * 10,
  };

  const docs = await Playlist.find({
    owner: user._id,
    name: { $in: ["WatchLater", "LikedVideos"] },
  });

  console.log(docs, "finded");
  if (!docs.length > 0) {
    await Playlist.create({
      name: "WatchLater",
      owner: user._id,
    });

    await Playlist.create({
      name: "LikedVideos",
      owner: user._id,
    });
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessoptions)
    .cookie("refreshToken", refreshToken, refreshoptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logotUser = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from doc
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("accesToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingrefreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized request"));
  }
  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid refresh Token"));
    }

    console.log(incomingrefreshToken, user.refreshToken);
    if (incomingrefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Refresh Token is Expired"));
    }
    const options = {
      httpOnly: true,
      // secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    // user.refreshToken = refreshToken; // updating the newrefrshToken in database to compare next time
    // await user.save({ validateBeforeSave: false });

    req.user = user;

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    console.log(error);
    // return res
    //   .status(401)
    //   .json(new ApiResponse(401, error?.message || "Invalid RefreshToken"));
  }
});

const changeCurrentPasssword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); // return true or false

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid oldPassword");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req);
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (fullname && email) {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { fullname, email } },
      { new: true }
    ).select("-password -refreshToken");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"));
  } else {
    throw new ApiError(400, "All fields are required");
  }
});

const updateUseravatar = asyncHandler(async (req, res) => {
  const avatartLocalpath = req.files?.path;
  if (!avatartLocalpath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uplooadCloudinary(avatartLocalpath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploadeing on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar Image updated successfullty"));
});
const updateUsercoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.files?.path;
  if (!coverImageLocalpath) {
    throw new ApiError(400, "coverImage file is required");
  }
  const coverImage = await uplooadCloudinary(coverImageLocalpath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploadeing on coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover Image updated successfullty"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // cause here where not using mongoose we are using aggregation of mongodb (Sdjdhif01830744 --> objectId(Sdjdhif01830744))
      },
    },
    {
      $lookup: {
        //"WatchHistory" field containing an array of videos that have been watched, and each video document will have an additional "owner" field containing information about the owner of the video.
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "WatchHistory",
        pipeline: [
          // res will be owner:{fullname,username,avatar}
          {
            $lookup: {
              // in lookup If there are no matches, the array will be empty. If there is at least one match, the array will contain all the matching documents.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullname: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              //The dollar first operator selects the first element from an array field, which in this case will be the first document in the "owner" array. This effectively converts the "owner" field from an array to a single object.
              owner: {
                $first: "$owner", // or owner: { dollar_arrayElemAt: ["dollar_owner", 0]
              },
              likes: {
                $size: "$likes",
              },
            },
          },
        ],
      },
    },
  ]); // at final user is an array and the first doc contains the userSchema fields with watchHistory field that has all vidoes with owners

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched success"
      )
    );
});

const createPlayList = asyncHandler(async (req, res) => {
  const { user } = req;
  const { name } = req.body;

  if (!user) {
    throw new ApiError(404, "unauthorized Request");
  }

  const playlist = await Playlist.create({
    name,
    owner: user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
});

const getPlaylist = asyncHandler(async (req, res) => {
  const { user } = req;
  const query = req.query;
  console.log(query);

  if (!user) {
    throw new ApiError(404, "unauthorized Request");
  }

  // res will be an playlist array where each doc conatin fields on videoSchema with addtional owner field added to it

  const pipeline = [
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          // res will be owner:{fullname,username,avatar}
          {
            $lookup: {
              // in lookup If there are no matches, the array will be empty. If there is at least one match, the array will contain all the matching documents.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullname: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              likes: {
                $size: "$likes",
              },
            },
          },
        ],
      },
    },
  ];

  if (Object.keys(query).length && query.Search_query) {
    pipeline.splice(0, 0, {
      $match: {
        owner: new mongoose.Types.ObjectId(user._id),
        name: query.Search_query,
      },
    });
  } else {
    pipeline.splice(0, 0, {
      $match: {
        owner: new mongoose.Types.ObjectId(user._id),
        name: {
          $nin: ["WatchLater", "LikedVideos"], // Exclude specific playlists
        },
      },
    });
  }

  const playlist = await Playlist.aggregate(pipeline);

  //  const playlist = await Playlist.find({owner:user._id}) // it will return an array of playlist

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        `${query.Search_query || "Playlists"} fetched successfully`
      )
    );
});

const getprofile = asyncHandler(async (req, res) => {
  const currentuserId = req.user._id;
  console.log(currentuserId);

  const currentUser = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(currentuserId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$subscriber" }, // Unwind the subscriber array
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "subscribed",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$subscribed" }, // Unwind the subscriber array
        ],
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    {
      $addFields: {
        subscribers: "$subscribers.subscriber",
        subscribedTo: "$subscribedTo.subscribed",

        subscribersCount: {
          $cond: {
            if: { $isArray: "$subscribers" },
            then: { $size: "$subscribers" },
            else: 0,
          },
        },
        subscribedToCount: {
          $cond: {
            if: { $isArray: "$subscribedTo" },
            then: { $size: "$subscribedTo" },
            else: 0,
          },
        },
        videosCount: {
          $cond: {
            if: { $isArray: "$videos" },
            then: { $size: "$videos" },
            else: 0,
          },
        },
        isSubscribed: {
          $cond: {
            if: { $isArray: "$subscribers.subscriber._id" },
            then: { $in: [req.user?._id, "$subscribers.subscriber._id"] },
            else: false, // or any default value if it's not an array
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        videosCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subscribers: 1,
        subscribedTo: 1,
      },
    },
  ]);

  // code for watchhistory
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // cause here where not using mongoose we are using aggregation of mongodb (Sdjdhif01830744 --> objectId(Sdjdhif01830744))
      },
    },
    {
      $lookup: {
        //"WatchHistory" field containing an array of videos that have been watched, and each video document will have an additional "owner" field containing information about the owner of the video.
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "WatchHistory",
        pipeline: [
          // res will be owner:{fullname,username,avatar}
          {
            $lookup: {
              // in lookup If there are no matches, the array will be empty. If there is at least one match, the array will contain all the matching documents.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullname: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              //The dollar first operator selects the first element from an array field, which in this case will be the first document in the "owner" array. This effectively converts the "owner" field from an array to a single object.
              owner: {
                $first: "$owner", // or owner: { dollar_arrayElemAt: ["dollar_owner", 0]
              },
              likes: {
                $size: "$likes",
              },
            },
          },
        ],
      },
    },
  ]); // at final user is an array and the first doc contains the userSchema fields with watchHistory field that has all vidoes with owners

  // code  for watchlater
  const pipeline1 = [
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          // res will be owner:{fullname,username,avatar}
          {
            $lookup: {
              // in lookup If there are no matches, the array will be empty. If there is at least one match, the array will contain all the matching documents.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullname: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              likes: {
                $size: "$likes",
              },
            },
          },
        ],
      },
    },
  ];

  pipeline1.splice(0, 0, {
    $match: {
      owner: new mongoose.Types.ObjectId(req.user._id),
      name: "WatchLater",
    },
  });
  const WatchLater = await Playlist.aggregate(pipeline1);

  // code for likedvideos
  const pipeline2 = [
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          // res will be owner:{fullname,username,avatar}
          {
            $lookup: {
              // in lookup If there are no matches, the array will be empty. If there is at least one match, the array will contain all the matching documents.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullname: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              likes: {
                $size: "$likes",
              },
            },
          },
        ],
      },
    },
  ];
  pipeline2.splice(0, 0, {
    $match: {
      owner: new mongoose.Types.ObjectId(req.user._id),
      name: "LikedVideos",
    },
  });
  const LikedVideos = await Playlist.aggregate(pipeline2);
  const pipeline3 = [
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          // res will be owner:{fullname,username,avatar}
          {
            $lookup: {
              // in lookup If there are no matches, the array will be empty. If there is at least one match, the array will contain all the matching documents.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullname: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              likes: {
                $size: "$likes",
              },
            },
          },
        ],
      },
    },
  ];
  // code for all playlist except wl lv

  pipeline3.splice(0, 0, {
    $match: {
      owner: new mongoose.Types.ObjectId(req.user._id),
      name: {
        $nin: ["WatchLater", "LikedVideos"], // Exclude specific playlists
      },
    },
  });

  const playlists = await Playlist.aggregate(pipeline3);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        [
          currentUser[0],
          { watchHistory: user[0].watchHistory },
          { WatchLater },
          { LikedVideos },
          { playlists },
        ],
        "userprofile fetched successfully"
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  console.log(req.query);
  console.log(req.user._id);
  let userid = req.user._id.toString();

  // search for the user
  // search for the video

  // Define a reusable lookup pipeline for user information
  const userLookupPipeline = [
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
      },
    },
  ];

  // Search Query
  const search = req.query.search_query;

  if (!search?.trim()) {
    throw new ApiError(400, "Search query is missing");
  }
  // searching for user

  const channel = await User.aggregate([
    {
      $match: {
        username: search?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
              pipeline: userLookupPipeline,
            },
          },
          { $unwind: "$subscriber" }, // Unwind the subscriber array
          {
            $replaceRoot: { newRoot: "$subscriber" }, // Promote the subscriber to top-level
          },
        ],
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },

    {
      $addFields: {
        subscribers: {
          $map: {
            input: "$subscribers",
            as: "subscriberId",
            in: "$$subscriberId",
          },
        },
        subs: "$subscribers",
        subscribersCount: {
          $cond: {
            if: { $isArray: "$subscribers" },
            then: { $size: "$subscribers" },
            else: 0,
          },
        },
        videosCount: {
          $cond: {
            if: { $isArray: "$videos" },
            then: { $size: "$videos" },
            else: 0,
          },
        },
        isSubscribed: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$subscribers" },
                { $size: "$subscribers" },
                { $gt: ["$subscribers.length", 0] },
              ],
            }, // Check for array, size, and non-empty
            then: { $in: [req.user._id, "$subscribers._id"] },
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        videosCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subs: 1,
        subscribers: 1,
      },
    },
  ]);

  // searching for videos

  const videos = await Video.aggregate([
    {
      $match: {
        title: { $regex: new RegExp(search, "i") },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: userLookupPipeline,
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },
  ]);

  // Error Handling and Response
  if (!channel.length && !videos.length) {
    throw new ApiError(404, "User or videos not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        [channel[0], videos],
        "User Channel Fetched Successfully"
      )
    );
});

const UploadVideo = asyncHandler(async (req, res) => {
  const { title, description, owner } = req.body;

  if ([title, description, owner].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalpath = req.files?.video[0]?.path;

  if (!videoLocalpath) {
    throw new ApiError(400, "Video file is required");
  }
  const thumbnailLocalpath = req.files.thumbnail[0]?.path;

  if (!thumbnailLocalpath) {
    throw new ApiError(400, "thumbnail file is required");
  }

  const videoFile = await uplooadCloudinary(videoLocalpath);
  const thumbnailFile = await uplooadCloudinary(thumbnailLocalpath);

  const video = await Video.create({
    title,
    description,
    owner,
    videoFile: videoFile.secure_url,
    thumbnail: thumbnailFile.secure_url,
    duration: videoFile.duration,
  });
  if (!video) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, video, "video Uploaded successfully"));
});

const getVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 6;
  const totalCount = await Video.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);
  const skip = Math.max(0, (page - 1) * limit);

  if (page <= totalPages) {
    const videos = await Video.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ["$owner", 0] },
        },
      },
    ])
      .skip(skip)
      .limit(limit);

    const videosinfo = {
      videos,
      currentPage: page,
      totalPages,
      totalCount,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, videosinfo, "video fetched successfully"));
  }
  return res.status(200).json(new ApiError(404, null, "No more videos Exists"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { AddIn } = req.query; // WatchLater //LikedVideos
  const { videoId } = req.body;

  //
  const video = await Playlist.findOne({
    owner: req.user._id,
    name: AddIn,
    videos: { $in: [videoId] },
  });

  if (video) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id: videoId },
          `video already added to  your ${AddIn}`
        )
      );
  } else {
    // Find the playlist
    const playlist = await Playlist.findOneAndUpdate(
      {
        owner: req.user._id, // You don't need to create a new ObjectId here
        name: AddIn,
      },
      { $push: { videos: videoId } }, // Update operation to push the video ID
      { new: true } // Return the updated playlist
    );

    // Send response or do further processing if needed

    return res
      .status(200)
      .json(
        new ApiResponse(200, playlist, `video added to ${AddIn} successfully`)
      );
  }
});

const getvideo = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const userLookupPipeline = [
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
      },
    },
  ];
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },
    {
      $unwind: "$owner", // Unwind the owner field to ensure it's an object
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner._id", // Use owner._id after unwinding
        foreignField: "channel",
        as: "subscribers",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
              pipeline: userLookupPipeline,
            },
          },
          { $unwind: "$subscriber" }, // Unwind the subscriber array
          {
            $replaceRoot: { newRoot: "$subscriber" }, // Promote the subscriber to top-level
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id", // Use owner._id after unwinding
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
        isliked: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$likes" },
                { $size: "$likes" },
                { $gt: ["$likes.length", 0] },
              ],
            }, // Check for array, size, and non-empty
            then: { $in: [req.user._id, "$likes.likeBy"] },
            else: false,
          },
        },
        isSubscribed: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$subscribers" },
                { $size: "$subscribers" },
                { $gt: ["$subscribers.length", 0] },
              ],
            }, // Check for array, size, and non-empty
            then: { $in: [req.user._id, "$subscribers._id"] },
            else: false,
          },
        },
      },
    },
  ]);

  // const
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const setSubscirbeState = asyncHandler(async (req, res) => {
  const { channelid: channel } = req.body;
  const { _id: subscriber } = req.user;

  const existedUser = await subscription.findOne({
    $and: [{ subscriber }, { channel }],
  });
  if (!existedUser) {
    const subs = await subscription.create({
      channel,
      subscriber,
    });

    return res.status(200).json(new ApiResponse(200, subs, "subscribed"));
  } else {
    const subs = await subscription.findOneAndDelete({
      $and: [{ subscriber }, { channel }],
    });
    return res.status(200).json(new ApiResponse(200, subs, "unsubscibed"));
  }
});
const setlike = asyncHandler(async (req, res) => {
  const { videoid: video } = req.body;
  const { _id: likeBy } = req.user;

  const existedUser = await Like.findOne({
    $and: [{ video }, { likeBy }],
  });
  if (!existedUser) {
    const like = await Like.create({
      video,
      likeBy,
    });

    return res.status(200).json(new ApiResponse(200, like, "liked"));
  } else {
    const removelike = await Like.findOneAndDelete({
      $and: [{ video }, { likeBy }],
    });
    return res
      .status(200)
      .json(new ApiResponse(200, removelike, "removeliked"));
  }
});

const deletePlayList = asyncHandler(async (req, res) => {
  const { name } = req.body;
  console.log(name, "name");
  const playlist = await Playlist.findOneAndDelete({
    name,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted Successfully"));
});

const AddToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId, date } = req.body;
  const { user } = req;

  try {
    const foundUser = await User.findOne({ _id: user.id });
    User.findById()
    if (!foundUser) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (!foundUser.watchHistory.includes(videoId)) {
      foundUser.watchHistory.push({ video: videoId, date });
      await foundUser.save(); // Save the changes to the user document
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          foundUser,
          "Video added to watch history successfully"
        )
      );
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json(new ApiError(500, null, "Internal server error"));
  }
});

const GetWatchHistory = asyncHandler(async (req, res) => {
  const { user } = req;
  try {
   const foundUser = await User.findOne({ _id: user.id }).populate(
     "watchHistory.video"
   );

   // Now, populate the 'owner' field in each item of 'watchHistory'
   const populatedHistory = await User.populate(foundUser, {
     path: "watchHistory.video.owner",
     select: "avatar fullname username _id",
   });

   const history = populatedHistory.watchHistory;



    console.log(foundUser);

    if (!foundUser) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, history, "watchHistory fetchced"));
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json(new ApiError(500, null, "Internal server error"));
  }
});

const deleteWatchHistory = asyncHandler(async (req, res) => {
  const { user } = req;
  const { id: idToRemove } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(user.id, {
      $pull: { watchHistory: { _id: idToRemove } },
    });
    console.log(updated);
    return res
      .status(200)
      .json(
        new ApiResponse(200, idToRemove, "Video removed from watchHistory")
      );
  } catch (error) {
    console.error(error); // Log the error to console for debugging
    return res
      .status(500)
      .json(new ApiError(500, null, "Internal server error"));
  }
});


const deleteAllWatchHistory = asyncHandler(async (req, res) => {
  const { user } = req;
  try {
    const updated = await User.findByIdAndUpdate(user.id, {
      $set: { watchHistory: [] },
    });
    console.log(updated);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "All videos removed from watchHistory"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, null, "Internal server error"));
  }
});

export {
  registerUser,
  loginUser,
  logotUser,
  refreshAccessToken,
  changeCurrentPasssword,
  getCurrentUser,
  updateAccountDetails,
  updateUseravatar,
  updateUsercoverImage,
  getUserChannelProfile,
  getWatchHistory,
  createPlayList,
  getPlaylist,
  getprofile,
  UploadVideo,
  getVideos,
  getvideo,
  addVideoToPlaylist,
  setSubscirbeState,
  setlike,
  deletePlayList,
  AddToWatchHistory,
  GetWatchHistory,
  deleteWatchHistory,
  deleteAllWatchHistory
};
