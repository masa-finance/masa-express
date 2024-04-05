import { SessionUser } from "@masa-finance/masa-sdk";
import { Store } from "express-session";

export interface CustomSessionFields {
  challenge: string;
  cookie: {
    expires: string;
  };
  user: SessionUser;
}

export interface MasaSessionArgs {
  sessionName: string;
  sessionNamespace: string;
  secret: string;
  ttl: number;
  store?: Store;
  domain: string;
  environment: string;
  sameSite?: "none" | "lax" | "strict";
  secure?: boolean;
  verbose?: boolean;
}
