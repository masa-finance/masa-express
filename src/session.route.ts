import express, { Request, RequestHandler, Response, Router } from "express";
import {
  checkSignatureHandler,
  getChallengeHandler,
  hasSessionChallengeHandler,
  logoutHandler,
  sessionCheckHandler,
} from "./session.controller";
import { MasaSessionMiddleware } from "./session.middleware";
import { MasaSessionArgs } from "./interfaces";

export const MasaSessionRouter = (
  args: MasaSessionArgs,
): {
  router: Router;
  middleware: RequestHandler;
} => {
  const { verbose, sessionName, sessionNamespace } = args;

  const middleware: RequestHandler = MasaSessionMiddleware(args);
  const router: Router = express.Router();

  router.use(middleware);

  router.get("/get-challenge", getChallengeHandler as never);

  router.use(hasSessionChallengeHandler as never);

  router.post(
    "/check-signature",
    checkSignatureHandler(sessionNamespace) as never,
  );

  router.use(sessionCheckHandler(verbose) as never);

  router.post("/logout", logoutHandler(sessionName) as never);

  router.get("/check", (request: Request, response: Response) => {
    response.send(request.session);
  });

  return {
    middleware,
    router,
  };
};
