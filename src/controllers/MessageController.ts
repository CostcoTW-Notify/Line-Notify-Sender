import { Application } from "express";
import { MessageService } from "@/services/messageService";
import { ApiResponse, ResponseStatus } from "@/models/apiResponse";
import { LineNotifyMessageRepository } from "@/repositories/lineNotifyMessageRepository";
import EnvHelper from "@/utils/envHelper";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";

export class MessageController {
  public static RegisterRoute(app: Application): void {
    /**
     * POST /Message/ProcessPendingItems
     * @tag Message
     * @return {ApiResponse} 200 - success
     */
    app.post("/Message/ProcessPendingItems", async (req, res) => {
      const repo = new LineNotifyMessageRepository(
        EnvHelper.GetMongoConnectionString()
      );
      const notifyService = new LineNotifyApiService();

      const service = new MessageService(repo, notifyService);

      try {
        const result = await service.processPendingMessage();
        res.json(new ApiResponse(undefined, undefined, result));
      } catch (error) {
        let reason = "Process pending message occur exception...";
        if (error instanceof Error) reason = error.message;
        res
          .status(400)
          .json(
            new ApiResponse(ResponseStatus.ProcessPendingMessageFail, reason)
          );
      }
    });

    /**
     * POST /Message/PendingItems
     * @tag Message
     * @return {ApiResponse} 201 - success
     */
    app.post("/Message/PendingItems", async (req, res) => {});
  }
}
