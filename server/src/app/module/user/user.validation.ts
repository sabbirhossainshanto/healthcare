import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long"),
  doctor: z.object({
    name: z
      .string("Name is required")
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name must be at most 50 characters long"),
    email: z.email("Invalid email address"),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact number must be at least 11 characters long")
      .max(14, "Contact number must be at most 14 characters long"),
    address: z
      .string("Address is required")
      .min(3, "Address must be at least 3 characters long")
      .max(100, "Address must be at most 100 characters long")
      .optional(),
    registrationNumber: z.string("Registration number is required"),
    experience: z
      .number("Experience is required")
      .min(0, "Experience must be at least 0 years")
      .max(50, "Experience must be at most 50 years"),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE],
      "Gender must be MALE or FEMALE",
    ),
    appointmentFee: z
      .number("Appointment fee is required")
      .min(0, "Appointment fee must be at least 0"),
    qualification: z
      .string("Qualification is required")
      .min(3, "Qualification must be at least 3 characters long")
      .max(50, "Qualification must be at most 50 characters long"),
    currentWorkingPlace: z
      .string("Current working place is required")
      .min(3, "Current working place must be at least 3 characters long")
      .max(50, "Current working place must be at most 50 characters long"),
    designation: z
      .string("Designation is required")
      .min(3, "Designation must be at least 3 characters long")
      .max(50, "Designation must be at most 50 characters long"),
  }),
  specialties: z
    .array(z.uuid(), "Specialties must be a array of uuid")
    .min(1, "At least one specialty is required"),
});
