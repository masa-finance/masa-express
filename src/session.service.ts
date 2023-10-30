import { CustomSessionFields } from "./interfaces";
import { v5 as uuidv5 } from "uuid";
import { recoverAddress, SessionUser, Templates } from "@masa-finance/masa-sdk";
import { Session, SessionData } from "express-session";

export const checkSignature =
  (sessionNamespace: string) =>
  async (
    session: Session & Partial<SessionData> & CustomSessionFields,
    signature: string,
    address: string,
  ): Promise<SessionUser | undefined> => {
    const msg = Templates.loginTemplate(
      session.challenge,
      session.cookie.expires.toUTCString(),
    );

    const recovered = await recoverAddress(msg, signature, false);

    if (recovered?.toLowerCase() === address?.toLowerCase()) {
      const sessionUser: SessionUser = {
        userId: uuidv5(address, sessionNamespace),
        address,
      };

      session.user = sessionUser;

      return sessionUser;
    } else {
      console.error("Recovery address mismatch", recovered, address);
    }
  };
