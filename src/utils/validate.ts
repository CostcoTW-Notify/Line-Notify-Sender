import { validationResult } from "express-validator";
import { Request } from "express";
import { RequestError } from "@/models/requestError";

export const ensureRequestIsValid = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new RequestError(errors);
  }
};
