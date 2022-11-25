import { Application, Request } from "express";
import { MessageService } from "@/services/messageService";
import { ApiResponse, ResponseStatus } from "@/models/apiResponse";
import { LineNotifyMessageRepository } from "@/repositories/lineNotifyMessageRepository";
import { ensureRequestIsValid } from "@/utils/validate";
import EnvHelper from "@/utils/envHelper";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";
import { body } from "express-validator";
import { MongoClient } from "mongodb";
import { PubSubEvent } from "@/models/events/pubSubEvent";
import { SendLineNotifyEventHandler } from "@/eventHandler/intergration/sendLineNotifyEventHandler";

export class IntergrationController {
  public static RegisterRoute(app: Application): void {
    /**
     * POST /Intergration/event
     * @tag Intergration
     * @param {PubSubEvent} request.body.required
     * @return {ApiResponse} 200 - success
     */
    app.post(
      "/Intergration/event",
      body("message.data").isString().notEmpty(),
      body("message.attributes.eventType").isString().notEmpty(),
      async (req: Request, res) => {
        ensureRequestIsValid(req);
        const mongo = new MongoClient(EnvHelper.GetMongoConnectionString());
        await mongo.connect();
        const repo = new LineNotifyMessageRepository(mongo);
        const notifyService = new LineNotifyApiService();
        const service = new MessageService(repo, notifyService);
        const eventHandler = new SendLineNotifyEventHandler(service);

        const pubSubEvent: PubSubEvent = req.body;

        let buff = Buffer.from(pubSubEvent.message.data, "base64"); // Ta-da
        let event = JSON.parse(buff.toString("utf-8"));
        try {
          await eventHandler.handleEvent(
            pubSubEvent.message.attributes.eventType,
            event
          );

          res.status(400).json(new ApiResponse());
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
      }
    );
  }
}
