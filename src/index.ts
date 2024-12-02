import express from "express";
import { router as userRouter } from "../routes/user";
import cookieParser from "cookie-parser";

export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRouter);
app.get("/", (req, res) => {
  res.send("hello");
});
