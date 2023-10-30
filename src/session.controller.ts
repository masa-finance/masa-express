import { NextFunction, Response } from "express";
import { checkSignature } from "./session.service";
import { parseError } from "./helpers";

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
  async (
    request: Express.RequestSession,
    response: Response,
    next: NextFunction,
  ) => {
    const { session, body } = request;

    try {
      const result = await checkSignature(sessionNamespace)(
        session,
        body.signature,
        body.address,
      );

      if (result) {
        response.json(result);
      } else {
        response.status(500).json({
          error: "Failed to check signature!",
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

export const sessionCheckHandler = (
  request: Express.RequestSession,
  response: Response,
  next: NextFunction,
) => {
  const { session } = request;

  console.log("READING COOKIE", session.id, session.cookie);

  if (!session.user) {
    return response.status(401).send({
      message: "You are not authorized, send a new challenge please",
    });
  }

  next();
};

export const hasSessionChallengeHandler = (
  request: Express.RequestSession,
  response: Response,
  next: NextFunction,
) => {
  const { session } = request;

  console.log("has challenge", session.challenge);

  if (!session.challenge) {
    console.info(
      `Session: ${JSON.stringify(
        session,
        null,
        2,
      )} has no challenge, rejected!`,
    );
    return response.status(401).send({
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
