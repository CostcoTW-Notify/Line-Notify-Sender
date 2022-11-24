import { Application, Request } from "express";
import { MessageService } from "@/services/messageService";
import { ApiResponse, ResponseStatus } from "@/models/apiResponse";
import { LineNotifyMessageRepository } from "@/repositories/lineNotifyMessageRepository";
import { ensureRequestIsValid } from "@/utils/validate";
import EnvHelper from "@/utils/envHelper";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";
import { AppendPendingMessage } from "@/models/appendPendingMessageModel";
import { body } from "express-validator";
import { MongoClient } from "mongodb";

export class MessageController {
  public static RegisterRoute(app: Application): void {
    /**
     * POST /Message/Pending/Process
     * @tag Message
     * @return {ApiResponse} 200 - success
     */
    app.post("/Message/Pending/Process", async (req, res) => {
      const mongo = new MongoClient(EnvHelper.GetMongoConnectionString());
      await mongo.connect();
      const repo = new LineNotifyMessageRepository(mongo);
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
      } finally {
        await mongo.close();
      }
    });

    /**
     * POST /Message/Pending
     * @summary Append pending Line-Notify message
     * @tag Message
     * @param {AppendPendingMessage} request.body.required
     * @return {ApiResponse} 201 - success
     */
    app.post(
      "/Message/Pending",
      body("tokens")
        .isArray()
        .withMessage("Not Array")
        .notEmpty()
        .withMessage("must have at least one message"),
      body("messages")
        .isArray()
        .withMessage("Not Array")
        .notEmpty()
        .withMessage("must have at least one message"),
      async (req: Request, res) => {
        ensureRequestIsValid(req);

        const mongo = new MongoClient(EnvHelper.GetMongoConnectionString());
        await mongo.connect();
        const service = new MessageService(
          new LineNotifyMessageRepository(mongo),
          new LineNotifyApiService()
        );

        const tokens: string[] = req.body.tokens;
        const messages: string[] = req.body.messages;

        try {
          const result = await service.appendPendingMessage(tokens, messages);
          if (!result) throw new Error("Service result is 'False'");
          res.json(new ApiResponse());
        } catch (error) {
          let reason = "Append pending message fail...";
          if (error instanceof Error) reason = error.message;
          res
            .status(400)
            .json(
              new ApiResponse(ResponseStatus.AppendPendingMessageFail, reason)
            );
        } finally {
          await mongo.close();
        }
      }
    );
  }
}
