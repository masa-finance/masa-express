import express, { Request, RequestHandler, Response, Router } from "express";
import {
  checkSignature,
  getChallenge,
  hasSessionChallenge,
  logout,
  sessionCheck,
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

  router.get("/get-challenge", getChallenge as never);

  router.use(hasSessionChallenge as never);

  router.post("/check-signature", checkSignature(sessionNamespace) as never);

  router.use(sessionCheck as never);

  router.post("/logout", logout(sessionName) as never);

  router.get("/check", (request: Request, response: Response) => {
    response.send(request.session);
  });

  return router;
};
