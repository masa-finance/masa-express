import session, { Store } from "express-session";
import { RequestHandler } from "express";

export const MasaSessionMiddleware = ({
  name,
  secret,
  ttl,
  store,
  domain = ".masa.finance",
  environment = "production",
}: {
  name: string;
  secret: string;
  ttl: number;
  store: Store;
  domain: string;
  environment: string;
}): RequestHandler => {
  return session({
    name,
    secret,
    saveUninitialized: false,
    resave: false,
    store,
    cookie: {
      // we need this to be used on multiple domains potentially when we talk about a true SSO
      sameSite: environment === "production" ? "none" : "lax",
      httpOnly: false,
      domain: environment === "production" ? domain : "localhost",
      path: "/",
      // this needs to be set in the lambda config explicitly
      secure: environment === "production",
      // max age is in milliseconds
      maxAge: ttl * 1000,
    },
  });
};
