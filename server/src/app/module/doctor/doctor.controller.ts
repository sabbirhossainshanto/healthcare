import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";

const getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await doctorService.getAllDoctors();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: doctors,
  });
});

export const doctorController = {
  getAllDoctors,
};
