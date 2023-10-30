import { Response } from "express";

export const parseError = (error: any) => {
  if (error.isJoi) return error.details[0];
  return JSON.stringify(error, Object.getOwnPropertyNames(error));
};

export const gracefullyHandleError = (
  response: Response,
  error: Error | unknown,
): void => {
  let status, message;

  if (message) {
    response.status(status || 200).json({
      success: false,
      message: message || "Unknown Error",
    });
  } else {
    // this should never happen!
    response.status(status || 500).end();
  }
};
