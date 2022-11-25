import { SendLineNotifyEventHandler } from "@/eventHandler/intergration/sendLineNotifyEventHandler";
import { EVENT_TYPE } from "@/models/events/intergratioin/SendLineNotifyEvent";
import { PubSubEvent } from "@/models/events/pubSubEvent";
import { MessageService } from "@/services/messageService";

describe("eventHandler/sendLineNotifyEventHandler.ts", () => {
  test("test handleEvent will handler event", async () => {
    const service = jest.fn() as unknown as MessageService;
    service.appendPendingMessage = jest.fn();
    const handler = new SendLineNotifyEventHandler(service);
    handler.setNext(new SendLineNotifyEventHandler(service));
    const pubSubEvent: PubSubEvent = {
      subscription: "sub",
      message: {
        attributes: {
          application: "test app",
          eventType: EVENT_TYPE,
        },
        data: "this is test message",
        messageId: "123456",
        publishTime: "2022-11-24T08:00:00",
      },
    };

    await handler.handleEvent(
      pubSubEvent.message.attributes.eventType,
      pubSubEvent.message.data
    );

    expect(service.appendPendingMessage).toHaveBeenCalledTimes(2);
  });
});
