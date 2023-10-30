import express, { Request, RequestHandler, Response, Router } from "express";
import {
  checkSignatureHandler,
  getChallengeHandler,
  hasSessionChallengeHandler,
  logoutHandler,
  sessionCheckHandler,
} from "./session.controller";

export const MasaSessionRouter = ({
  sessionMiddleware,
  sessionName,
  sessionNamespace,
}: {
  sessionMiddleware: RequestHandler;
  sessionName: string;
  sessionNamespace: string;
}) => {
  const router: Router = express.Router();

  router.use(sessionMiddleware);

  router.get("/get-challenge", getChallengeHandler as never);

  router.use(hasSessionChallengeHandler as never);

  router.post(
    "/check-signature",
    checkSignatureHandler(sessionNamespace) as never,
  );

  router.use(sessionCheckHandler as never);

  router.post("/logout", logoutHandler(sessionName) as never);

  router.get("/check", (request: Request, response: Response) => {
    response.send(request.session);
  });

  return router;
};
