import { Application } from "express";
import { PendingMessageService } from "@/services/pendingMessageService";
import { ApiResponse, ResponseStatus } from "@/models/apiResponse";

export class PendingMessageController {
  public static RegisterRoute(app: Application): void {
    /**
     * POST /PendingMessage/Process
     * @tag PendingMessage
     * @return {ApiResponse} 200 - success
     */
    app.post("/PendingMessage/Process", async (req, res) => {
      const service = new PendingMessageService();
      try {
        await service.processPendingMessage();
        res.json(new ApiResponse());
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
  }
}
