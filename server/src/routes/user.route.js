import { Router } from "express";
import {
  AddToWatchHistory,
  GetWatchHistory,
  UploadVideo,
  addVideoToPlaylist,
  changeCurrentPasssword,
  createPlayList,
  deleteAllWatchHistory,
  deletePlayList,
  deleteWatchHistory,
  getCurrentUser,
  getPlaylist,
  getUserChannelProfile,
  getVideos,
  getWatchHistory,
  getprofile,
  getvideo,
  loginUser,
  logotUser,
  refreshAccessToken,
  registerUser,
  setSubscirbeState,
  setlike,
  updateAccountDetails,
  updateUseravatar,
  updateUsercoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
// router.route("/login").post(registerUser);
router.route("/login").post(loginUser);

//secured Routes
router.route("/logout").post(verifyJWT, logotUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route('/change-password').post(verifyJWT,changeCurrentPasssword)
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/update-account')
.patch(verifyJWT,updateAccountDetails)
router.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUseravatar)
router.route('/cover-image').patch(verifyJWT,upload.single('coverImage'),updateUsercoverImage)
// router.route('/results').get(verifyJWT,getUserChannelProfile)
router.route('/watchHistory').get(verifyJWT,getWatchHistory)
router.route("/createplaylist").post(verifyJWT, createPlayList);
router.route("/deleteplaylist").post(verifyJWT, deletePlayList);
router.route("/playlist").get(verifyJWT, getPlaylist);
router.route('/profile').get(verifyJWT,getprofile);
router.route('/videos').get(verifyJWT,getVideos)
router.route('/addTo').post(verifyJWT,addVideoToPlaylist);
router.route("/getvideo").post(verifyJWT, getvideo);
router.route("/setsubscirbe").post(verifyJWT, setSubscirbeState);
router.route("/setlike").post(verifyJWT, setlike);
router.route('/AddToWatchHistory').post(verifyJWT,AddToWatchHistory)
router.route("/GetWatchHistory").get(verifyJWT, GetWatchHistory);
router.route("/deleteWatchHistory").post(verifyJWT,deleteWatchHistory);
router.route("/deleteAllWatchHistory").post(verifyJWT,deleteAllWatchHistory);


router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  UploadVideo
);


export default router;
