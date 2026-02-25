import { specialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSpecialty = catchAsync(async (req, res) => {
  const payload = req.body;
  const specialty = await specialtyService.createSpecialty(payload);
  sendResponse(res, {
    httpStatus: 201,
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
});

const getAllSpecialties = catchAsync(async (req, res) => {
  const specialties = await specialtyService.getAllSpecialties();
  sendResponse(res, {
    httpStatus: 200,
    success: true,
    message: "Specialties retrieved successfully",
    data: specialties,
  });
});

const deleteSpecialty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await specialtyService.deleteSpecialty(id as string);
  sendResponse(res, {
    httpStatus: 200,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtyController = {
  createSpecialty,
  getAllSpecialties,
  deleteSpecialty,
};
