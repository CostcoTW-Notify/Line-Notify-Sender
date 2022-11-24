export interface EventAttributes {
  eventType: string;
  application: string;
}

export interface EventMessage {
  attributes: EventAttributes;
  data: string;
  messageId: string;
  publishTime: string;
}

export interface PubSubEvent {
  message: EventMessage;
  subscription: string;
}
