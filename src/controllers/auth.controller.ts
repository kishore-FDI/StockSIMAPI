import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const user = await authService.register(email, password, username);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    console.log(result);
    res
      .status(200)
      .cookie("refreshToken", result?.token.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: result?.token.accessToken });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const user = authService.verifyRefreshToken(token);
    const tokens = authService.generateTokens(user as any);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.json({ accessToken: tokens.accessToken });
  } catch {
    res.sendStatus(403);
  }
};
