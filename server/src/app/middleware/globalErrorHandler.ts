/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import { ZodError } from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from global error handler", error);
  }

  let errorSources: TErrorSource[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";
  let stack: string | undefined;

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = error.stack;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    stack = error.stack;
    errorSources = [
      {
        path: "",
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = error.message;
    stack = error.stack;
    errorSources = [
      {
        path: "",
        message: error.message,
      },
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? error : undefined,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
