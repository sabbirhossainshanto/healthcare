import { JWTPayload } from "better-auth";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import { cookieUtils } from "./cookie";

const getAccessToken = (payload: JWTPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
  return accessToken;
};

const getRefreshToken = (payload: JWTPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
  return refreshToken;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 60 * 24, //1d
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 60 * 24 * 7, //7d
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 60 * 24, //1d
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
