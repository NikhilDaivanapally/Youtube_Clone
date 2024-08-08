import mongoose, { Schema } from "mongoose";
const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
   
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Playlist = mongoose.model("Playlist", playlistSchema);

 new Playlist({
  name: "Watch Later",
  videos: [], // Assuming an empty array for now
  created_at: new Date(),
  // Add other necessary fields as per your schema
});

 new Playlist({
  name: "Liked Videos",
  videos: [],
  created_at: new Date(),
  // Add other necessary fields as per your schema
});
