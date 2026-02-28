import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}
interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const result = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!result?.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }

  try {
    const patient = await prisma.$transaction(async (tx) => {
      return await tx.patient.create({
        data: {
          userId: result?.user?.id,
          name,
          email,
        },
      });
    });
    const accessToken = tokenUtils.getAccessToken({
      userId: result?.user?.id,
      role: result?.user?.role,
      name: result?.user?.name,
      email: result?.user?.email,
      status: result?.user?.status,
      isDeleted: result?.user?.isDeleted,
      emailVerified: result?.user?.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: result?.user?.id,
      role: result?.user?.role,
      name: result?.user?.name,
      email: result?.user?.email,
      status: result?.user?.status,
      isDeleted: result?.user?.isDeleted,
      emailVerified: result?.user?.emailVerified,
    });
    return { ...result, patient, accessToken, refreshToken };
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: result?.user?.id,
      },
    });
    throw error;
  }
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (result?.user?.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }
  if (result?.user?.isDeleted || result?.user?.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: result?.user?.id,
    role: result?.user?.role,
    name: result?.user?.name,
    email: result?.user?.email,
    status: result?.user?.status,
    isDeleted: result?.user?.isDeleted,
    emailVerified: result?.user?.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: result?.user?.id,
    role: result?.user?.role,
    name: result?.user?.name,
    email: result?.user?.email,
    status: result?.user?.status,
    isDeleted: result?.user?.isDeleted,
    emailVerified: result?.user?.emailVerified,
  });

  return { ...result, accessToken, refreshToken };
};

export const authService = {
  registerPatient,
  loginUser,
};
