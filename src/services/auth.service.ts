import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const generateTokens = (user: { id: string; email: string }) => {
  const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

export const register = async (
  email: string,
  password: string,
  username: string
) => {
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) throw new Error("Email already registered");

  const usernameExists = await prisma.user.findUnique({ where: { username } });
  if (usernameExists) throw new Error("UserName already registered");

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hash,
    },
  });

  return { id: user.id, email: user.email };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password || "");
  if (!match) throw new Error("Invalid credentials");

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) return;

  const token = generateTokens({ id: user.id, email });

  return { token, user: { id: user.id, email: user.email } };
};
