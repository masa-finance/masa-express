import { SessionUser } from "@masa-finance/masa-sdk";

export interface CustomSessionFields {
  challenge: string;
  cookie: {
    expires: string;
  };
  user: SessionUser;
}
