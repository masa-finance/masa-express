import { NextFunction, Response } from "express";
import { checkSignature } from "./session.service";
import { parseError } from "./helpers";
import { BaseResult, ISession, SessionUser } from "@masa-finance/masa-sdk";

export const getChallengeHandler = async (
  request: Express.RequestSession,
  response: Response,
  next: NextFunction,
) => {
  const { session } = request;

  try {
    const expires = session.cookie.expires.toUTCString();

    if (!session.challenge) {
      const challenge: string = generateNonce(32);
      console.log("generated challenge!", challenge);
      session.challenge = challenge;
    }

    return response.json({
      challenge: session.challenge,
      expires,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error while getting challenge`, error.message);
    }

    next(error);
  }
};

export const checkSignatureHandler =
  (sessionNamespace: string) =>
  (
    request: Express.RequestSession,
    response: Response<SessionUser | BaseResult>,
    next: NextFunction,
  ): void => {
    const { session, body } = request;

    try {
      const result = checkSignature(sessionNamespace)(
        session,
        body.signature,
        body.address,
      );

      if (result) {
        response.json(result);
      } else {
        response.status(500).json({
          success: false,
          message: "Failed to check signature!",
        });
      }
    } catch (error: unknown) {
      console.error("ERROR", error);

      let message = `Error while validating signature ${body.address} `;

      if (error instanceof Error) {
        message += error.message;
      }
      console.error(message);

      next(error);
    }
  };

export const logoutHandler =
  (sessionName: string) =>
  async (request: Express.RequestSession, response: Response) => {
    const { session } = request;

    try {
      const user = session.user;
      if (user) {
        console.log("USER", user);
        session.destroy((error: unknown) => {
          if (error) {
            throw error;
          }
          response.clearCookie(sessionName);
          return response.send({
            status: "success",
          });
        });
      } else {
        return response.status(404).send({
          status: "Session not found",
        });
      }
    } catch (error: unknown) {
      return response.status(422).send(parseError(error));
    }
  };

export const sessionCheckHandler =
  (verbose?: boolean) =>
  (
    request: Express.RequestSession,
    response: Response<ISession | BaseResult>,
    next: NextFunction,
  ) => {
    const { session } = request;

    if (verbose) {
      console.info("READING COOKIE", session.id, session.cookie);
    }

    if (!session.user) {
      return response.status(401).send({
        success: false,
        message: "You are not authorized, send a new challenge please",
      });
    }

    next();
  };

export const hasSessionChallengeHandler = (
  request: Express.RequestSession,
  response: Response<ISession | BaseResult>,
  next: NextFunction,
) => {
  const { session } = request;

  if (session.challenge) {
    console.log(`${session.id} has challenge ${session.challenge}`);
  } else {
    console.info(
      `Session: ${JSON.stringify(
        session,
        null,
        2,
      )} has no challenge, rejected!`,
    );

    return response.status(401).send({
      success: false,
      message: "You must have a challenge",
    });
  }

  next();
};

export const generateNonce = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};
