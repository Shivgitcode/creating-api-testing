import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { config } from "dotenv";
config();

const registerSchema = z.object({
  username: z.string({ message: "username missing" }),
  email: z.string().email(),
  password: z.string().min(6).max(8),
});
type Register = z.infer<typeof registerSchema>;

export const registerUser = async (req: Request, res: Response) => {
  const { success, error } = registerSchema.safeParse(req.body);
  const registerData: Register = req.body;
  if (!success) {
    res.status(411).json({
      message: "incorrect input",
      error,
    });
    return;
  }
  const hashPass = await bcrypt.hash(registerData.password, 12);
  const createUser = await prisma.user.create({
    data: {
      username: registerData.username,
      email: registerData.email,
      password: hashPass,
    },
  });
  res.status(200).json({
    message: "user created successfully",
    data: createUser.username,
  });
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(8),
});
type Login = z.infer<typeof loginSchema>;

export const login = async (req: Request, res: Response) => {
  try {
    const { success, error } = loginSchema.safeParse(req.body);
    if (!success) {
      res.status(411).json({
        message: "incorrect input",
        error,
      });
      return;
    }
    const loginData: Login = req.body;
    const findUser = await prisma.user.findUnique({
      where: {
        email: loginData.email,
      },
    });
    if (!findUser) {
      res.status(404).json({
        message: "user not registered",
      });
      return;
    }
    const hashPass = findUser?.password;
    const isPassword = await bcrypt.compare(
      loginData.password,
      hashPass as string
    );
    if (isPassword) {
      const token = await jwt.sign(
        findUser as User,
        process.env.JWT_SECRET as string
      );
      res.cookie("jwt", token, {
        maxAge: 60 * 60 * 1000,
        sameSite: "none",
        httpOnly: true,
      });
      res.status(200).json({
        status: "success",
        data: token,
      });
    } else {
      res.status(401).json({
        status: "failed",
        message: "invalid username or password",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err,
    });
  }
};
