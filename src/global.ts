import "express";
import { CustomSessionFields } from "./interfaces";

type ExpressRequest = import("express").Request;
type Session = import("express-session").Session;
type SessionData = import("express-session").SessionData;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface RequestSession extends ExpressRequest {
      session: Session & Partial<SessionData> & CustomSessionFields;
    }
  }
}
