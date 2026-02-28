import status from "http-status";
import { Role, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {
  const specialties: Specialty[] = [];
  for (const specialtyId of payload.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId },
    });
    if (!specialty) {
      throw new AppError(
        status.NOT_FOUND,
        `Specialty with id ${specialtyId} not found`,
      );
    }
    specialties.push(specialty);
  }
  const userExist = await prisma.user.findUnique({
    where: { email: payload.doctor.email },
  });
  if (userExist) {
    throw new AppError(status.CONFLICT, "User with this email already exist");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.doctor.name,
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      needPasswordChange: true,
    },
  });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });

      await tx.doctorSpecialty.createMany({
        data: specialties.map((specialty) => ({
          doctorId: doctorData.id,
          specialtyId: specialty.id,
        })),
      });

      const doctor = await tx.doctor.findUnique({
        where: { id: doctorData.id },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          averageRating: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return doctor;
    });

    return result;
  } catch (error) {
    console.log("Transaction error", error);
    await prisma.user.delete({
      where: {
        email: userData.user.email,
      },
    });
    throw error;
  }
};

export const userService = {
  createDoctor,
};
