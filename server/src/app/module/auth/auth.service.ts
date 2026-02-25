import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";

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
    throw new Error("Failed to register patient");
  }
  return result;
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
    throw new Error("User is blocked");
  }
  if (result?.user?.isDeleted || result?.user?.status === UserStatus.DELETED) {
    throw new Error("User is deleted");
  }
  return result;
};

export const authService = {
  registerPatient,
  loginUser,
};
