import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getUserChannelProfile } from "./controllers/user.controller.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import status from "express-status-monitor"

const app = express();


app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(status())
//routes

import userRouter from "./routes/user.route.js";

app.use("/user", userRouter);
app.route("/result").get(verifyJWT,getUserChannelProfile);


//routes declaration

export { app };
