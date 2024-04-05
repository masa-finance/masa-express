import { SessionUser } from "@masa-finance/masa-sdk";

export interface CustomSessionFields {
  verbose: boolean;
  challenge: string;
  cookie: {
    expires: string;
  };
  user: SessionUser;
}
