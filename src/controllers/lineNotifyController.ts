import { Application, Request } from "express";
import { body } from "express-validator";
import { ensureRequestIsValid } from "@/utils/validate";
import { ApiResponse, ResponseStatus } from "@/models/apiResponse";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";

export class LineNotifyController {
  public static RegisterRoute(app: Application): void {
    /**
     * POST /LineNotify/SendMessage
     * @summary Send message to chat room
     * @tag LineNotify
     * @param {SendNotifyMessage} request.body.required
     * @return {ApiResponse} 200 - success
     */
    app.post(
      "/LineNotify/SendMessage",
      body("token").isString(),
      body("message").isString(),
      async (req: Request, res) => {
        ensureRequestIsValid(req);
        const service = new LineNotifyApiService();
        let result = await service.sendMessageToChatRoom(
          req.body.token,
          req.body.message
        );
        if (result) res.json(new ApiResponse());
        else
          res.json(
            new ApiResponse(
              ResponseStatus.NotifyTokenInvalid,
              "Chat room token invalid ..."
            )
          );
      }
    );

    /**
     * POST /LineNotify/FetchRoomStatus
     * @summary Fetch chat room status
     * @tag LineNotify
     * @param {LineNotifyToken} request.body.required
     * @return {LineNotifyRoomStatus} 200 - ok
     */
    app.post(
      "/LineNotify/FetchRoomStatus",
      body("token").isString(),
      async (req: Request, res) => {
        ensureRequestIsValid(req);
        const service = new LineNotifyApiService();
        let result = await service.fetchChatRoomStatus(req.body.token);
        if (result.status === 200) {
          res.json(result);
        } else {
          res.json(
            new ApiResponse(
              ResponseStatus.NotifyTokenInvalid,
              "Chat room token invalid ..."
            )
          );
        }
      }
    );

    /**
     * POST /LineNotify/RevokeRoomToken
     * @summary Revoke chat room token
     * @tag LineNotify
     * @param {LineNotifyToken} request.body.required
     * @return {ApiResponse} 200 - success
     */
    app.post(
      "/LineNotify/RevokeRoomToken",
      body("token").isString(),
      async (req: Request, res) => {
        ensureRequestIsValid(req);
        const service = new LineNotifyApiService();
        let result = await service.revokeChatRoomToken(req.body.token);
        if (result) res.json(new ApiResponse());
        else
          res.json(
            new ApiResponse(
              ResponseStatus.NotifyTokenInvalid,
              "Chat room token invalid ..."
            )
          );
      }
    );
  }
}
