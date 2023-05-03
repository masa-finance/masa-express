import session, { Store } from "express-session";
import { RequestHandler } from "express";

export const MasaSessionMiddleware = ({
  sessionName,
  secret,
  ttl,
  store,
  domain = ".masa.finance",
  environment,
  sameSite,
  secure,
}: {
  sessionName: string;
  secret: string;
  ttl: number;
  store?: Store;
  domain: string;
  environment: string;
  sameSite?: "none" | "lax" | "strict";
  secure?: boolean;
}): RequestHandler => {
  console.log({
    name: sessionName,
    secret,
    saveUninitialized: false,
    resave: false,
    store,
    cookie: {
      // we need this to be used on multiple domains potentially when we talk about a true SSO
      sameSite: sameSite
        ? sameSite
        : environment === "production"
        ? "none"
        : "lax",
      httpOnly: false,
      domain: environment === "production" ? domain : "localhost",
      path: "/",
      // this needs to be set in the lambda config explicitly
      secure: secure !== undefined ? secure : environment === "production",
      // max age is in milliseconds
      maxAge: ttl * 1000,
    },
  });
  return session({
    name: sessionName,
    secret,
    saveUninitialized: false,
    resave: false,
    store,
    cookie: {
      // we need this to be used on multiple domains potentially when we talk about a true SSO
      sameSite: sameSite
        ? sameSite
        : environment === "production"
        ? "none"
        : "lax",
      httpOnly: false,
      domain: environment === "production" ? domain : "localhost",
      path: "/",
      // this needs to be set in the lambda config explicitly
      secure: secure !== undefined ? secure : environment === "production",
      // max age is in milliseconds
      maxAge: ttl * 1000,
    },
  });
};
