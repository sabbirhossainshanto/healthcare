import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";

const createDoctor = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await userService.createDoctor(payload);
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

export const userController = {
  createDoctor,
};
