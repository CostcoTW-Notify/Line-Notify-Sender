export enum ResponseStatus {
  Success = 0,
  NotifyTokenInvalid = 401,
  ProcessPendingMessageFail = 402,
}

/**
 * API Response message
 * @typedef {object} ApiResponse
 * @property {number} status
 * @property {string} message
 */
export class ApiResponse {
  status: number;
  message: string;

  constructor(status_code?: ResponseStatus, msg?: string) {
    if (status_code === undefined) this.status = ResponseStatus.Success;
    else this.status = status_code;
    if (msg === undefined) this.message = "Successful";
    else this.message = msg;
  }
}
