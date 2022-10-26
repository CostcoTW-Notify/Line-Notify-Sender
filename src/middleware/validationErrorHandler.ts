import { Request, Response, NextFunction, Errback } from "express";
import { RequestError } from "@/models/requestError";

export const validationErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestError)
    res.status(400).json({ errors: err.errorList.array() });
  else next();
};
