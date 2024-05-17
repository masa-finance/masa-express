import { CustomSessionFields } from "./interfaces";
import { v5 as uuidv5 } from "uuid";
import { recoverAddress, SessionUser, Templates } from "@masa-finance/masa-sdk";
import { Session, SessionData } from "express-session";

const recoverSessionUser = (
  sessionNamespace: string,
  msg: string,
  signature: string,
  address: string,
): SessionUser | undefined => {
  const recovered = recoverAddress(msg, signature, false);

  if (recovered?.toLowerCase() === address?.toLowerCase()) {
    const sessionUser: SessionUser = {
      userId: uuidv5(address, sessionNamespace),
      address,
    };

    return sessionUser;
  } else {
    console.error("Recovery address mismatch", recovered, address);
  }
};

export const checkSignature =
  (sessionNamespace: string) =>
  async (
    session: Session & Partial<SessionData> & CustomSessionFields,
    signature: string,
    address: string,
  ): Promise<SessionUser | undefined> => {
    let msg = Templates.loginTemplate(
      session.challenge,
      session.cookie.expires.toUTCString(),
    );

    let sessionUser = recoverSessionUser(
      sessionNamespace,
      msg,
      signature,
      address,
    );

    if (!sessionUser) {
      console.warn("First pass login failed! Retrying next template!");

      msg = Templates.loginTemplateNext(
        session.challenge,
        session.cookie.expires.toUTCString(),
      );

      sessionUser = recoverSessionUser(
        sessionNamespace,
        msg,
        signature,
        address,
      );
    }

    if (sessionUser) {
      session.user = sessionUser;

      console.log("Login successful!");

      return sessionUser;
    }
  };
