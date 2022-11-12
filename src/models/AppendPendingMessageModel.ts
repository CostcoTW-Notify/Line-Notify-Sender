/**
 * Send message model
 * @typedef {object} AppendPendingMessage
 * @property {string[]} tokens
 * @property {string[]} messages
 */
export interface AppendPendingMessage {
  tokens: string[];
  messages: string[];
}
