WatchLater
LikedVideos
normalPlaylist

note : when a user initially registers and login's in for the first time a watchLater and LikedVideos playlist is created for that user 

api will handle the req based on query if it found then is return those particular playlist
if no query is received it will send all playlist except watchlater and likedvideos 


const getPlaylist = asyncHandler(async (req, res) => {
  const { user } = req;
  const query = req.query;

  if (!user) {
    throw new ApiError(404, "Unauthorized Request");
  }

  let pipeline = [
    {
      $match: {
        owner: mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        "owner": { $arrayElemAt: ["$owner", 0] }, // Convert owner array to object
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "videos._id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        "videos.likes": { $size: "$likes" },
        "comments.owner": { $arrayElemAt: ["$comments.owner", 0] } // Convert comments' owner array to object
      },
    },
    {
      $unset: ["likes"], // Remove unnecessary fields
    },
  ];

  if (Object.keys(query).length && query.Search_query) {
    pipeline.splice(2, 0, {
      $match: {
        name: query.Search_query,
      },
    });
  } else {
    pipeline.splice(2, 0, {
      $match: {
        name: {
          $nin: ["WatchLater", "LikedVideos"], // Exclude specific playlists
        },
      },
    });
  }

  const playlist = await Playlist.aggregate(pipeline);

  return res.status(200).json(
    new ApiResponse(
      200,
      playlist,
      `${query.Search_query || "Playlists"} fetched successfully`
    )
  );
});
