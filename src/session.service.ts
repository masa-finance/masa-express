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
  let sessionUser: SessionUser | undefined = undefined;

  const recovered = recoverAddress(msg, signature, false);

  if (recovered?.toLowerCase() === address?.toLowerCase()) {
    sessionUser = {
      userId: uuidv5(address, sessionNamespace),
      address,
    };
  } else {
    console.error("Recovery address mismatch", recovered, address);
  }

  return sessionUser;
};

export const checkSignature =
  (sessionNamespace: string) =>
  (
    session: Session & Partial<SessionData> & CustomSessionFields,
    signature: string,
    address: string,
  ): SessionUser | undefined => {
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

      return sessionUser;
    }
  };
