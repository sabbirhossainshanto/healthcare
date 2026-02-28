import status from "http-status";
import { ZodError } from "zod";
import { TErrorSource } from "../interfaces/error.interface";

export const handleZodError = (error: ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod validation error";
  const errorSources: TErrorSource[] = [];
  error.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => ") || "Unknown",
      message: issue.message,
    });
  });
  return {
    success: false,
    statusCode,
    message,
    errorSources,
  };
};
