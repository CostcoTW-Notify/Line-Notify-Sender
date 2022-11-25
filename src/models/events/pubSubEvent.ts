/**
 * GCP Pub Sub EventAttributes
 * @typedef {object} EventAttributes
 * @property {string} eventType
 * @property {string} application
 */
export interface EventAttributes {
  eventType: string;
  application: string;
}

/**
 * GCP Pub Sub EventMessage Model
 * @typedef {object} EventMessage
 * @property {string} publishTime
 * @property {string} messageId
 * @property {string} data
 * @property {EventAttributes} attributes
 */
export interface EventMessage {
  attributes: EventAttributes;
  data: string;
  messageId: string;
  publishTime: string;
}

/**
 * GCP Pub Sub Event model
 * @typedef {object} PubSubEvent
 * @property {string} subscription
 * @property {EventMessage} message
 */
export interface PubSubEvent {
  message: EventMessage;
  subscription: string;
}
