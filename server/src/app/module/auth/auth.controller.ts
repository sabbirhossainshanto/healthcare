import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";

const registerPatient = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload);
  sendResponse(res, {
    httpStatus: 201,
    success: true,
    message: "Patient registered successfully",
    data: result,
  });
});
const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  sendResponse(res, {
    httpStatus: 201,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const authController = {
  registerPatient,
  loginUser,
};
