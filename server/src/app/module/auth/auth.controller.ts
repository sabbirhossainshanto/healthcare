import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload);
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token!);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Patient registered successfully",
    data: result,
  });
});
const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const authController = {
  registerPatient,
  loginUser,
};
