import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // console.log(req)
  console.log(req.cookies, "cookie");
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  console.log(token);
  
  if (!token) {
    if (req.cookies.refreshToken) {
      refreshAccessToken(req, _, next);
    } else {     
      throw new ApiError(401, "Unathorized request");
    }
  } else {
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  }
});
