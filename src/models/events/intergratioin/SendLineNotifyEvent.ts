export const EVENT_TYPE = "SendLineNotify";

export interface SendLineNotifyEvent {
  token: string;
  message: string;
}
