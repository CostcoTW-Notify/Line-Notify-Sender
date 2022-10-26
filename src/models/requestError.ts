import { Result, ValidationError } from "express-validator";

export class RequestError extends Error {
  errorList: Result<ValidationError>;

  constructor(errors: Result<ValidationError>) {
    super("Request Body/Params not valid...");
    this.errorList = errors;
  }
}
