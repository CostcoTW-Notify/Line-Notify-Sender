/**
 * SampleResponse2
 * @typedef {object} SampleResponse
 * @property {string} message
 * @property {number} status
 */
export interface SampleResponse {
  status: number;
  message: string;
}

/**
 * Sample Request
 * @typedef {object} SampleRequest
 * @property {string} paramStr - The title
 * @property {number} paramNum - The year - double
 */
export interface SampleRequest {
  paramStr: string;
  paramNum: number;
}
