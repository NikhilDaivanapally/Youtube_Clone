const getPlaylist = asyncHandler(async (req, res) => {
  const { user } = req;
  const query = req.query;

  if (!user) {
    throw new ApiError(404, "unauthorized Request");
  }

  if(Object.keys(query).length){

   const playlist = await Playlist.aggregate([
     // res will be an playlist array where each doc conatin fields on videoSchema with addtional owner field added to it
     {
       $match: {
         owner: new mongoose.Types.ObjectId(user._id),
       },
     },
     {
       $match: {
         name: req.query.Search_query,
       },
     },

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
   ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          `${req.query.Search_query} fetched successfully`
        )
      );

  }

  else{

// getting playlist except watchLater , likedvideos

  const playlist = await Playlist.aggregate([
    // res will be an playlist array where each doc conatin fields on videoSchema with addtional owner field added to it
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $match: {
        name: {
          $not: {
            $in: ["WatchLater", "LikedVideos"], // List of names you want to exclude
          },
        },
      },
    },
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
  ]);
  //  const playlist = await Playlist.find({owner:user._id}) // it will return an array of playlist

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "palylists fetched successfully"));
}
}); optimize the code and fix the errors



 $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },

======

 isSubscribed: { $in: [req.user?._id, "$subscribers.subscriber._id"] },
