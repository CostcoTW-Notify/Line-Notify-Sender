export enum ResponseStatus {
  Success = 0,
  NotifyTokenInvalid = 401,
  ProcessPendingMessageFail = 402,
  AppendPendingMessageFail = 403,
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
  data?: object;

  constructor(status_code?: ResponseStatus, msg?: string, data?: object) {
    if (status_code == null) this.status = ResponseStatus.Success;
    else this.status = status_code;
    if (msg == null) this.message = "Successful";
    else this.message = msg;
    if (data != null) this.data = data;
  }
}
