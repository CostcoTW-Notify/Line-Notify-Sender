/**
 * Send message model
 * @typedef {object} SendNotifyMessage
 * @property {string} token
 * @property {string} message
 */
export interface SendNotifyMessage {
  token: string;
  message: string;
}

/**
 * Line Notify token model
 * @typedef {object} LineNotifyToken
 * @property {string} token
 */
export interface LineNotifyToken {
  token: string;
}

/**
 * Line Notify room status
 * @typedef {object} LineNotifyRoomStatus
 * @property {number} status
 * @property {string} message
 * @property {string} target
 * @property {string} targetType
 */
export interface LineNotifyRoomStatus {
  /**
   * Value according to HTTP status code
   * 200: Success・Access token valid
   * 401: Invalid access token
   */
  status: number;
  // Message visible to end-user
  message: string;
  /**
   * If the notification target is a user: "USER"
   * If the notification target is a group: "GROUP"
   */
  targetType: string;
  /**
   * If the notification target is a user, displays user name. If acquisition fails, displays "null."
   * If the notification target is a group, displays group name. If the target user has already left the group, displays "null."
   */
  target: string;
}
