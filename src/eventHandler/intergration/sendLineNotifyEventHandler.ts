import { EventHandler } from "./eventHandler";
import {
  EVENT_TYPE,
  SendLineNotifyEvent,
} from "@/models/events/intergratioin/SendLineNotifyEvent";
import { MessageService } from "@/services/messageService";

export class SendLineNotifyEventHandler extends EventHandler {
  private MessageService: MessageService;

  constructor(service: MessageService) {
    super();
    this.MessageService = service;
  }

  public async handleEvent(eventType: string, event: any): Promise<void> {
    if (eventType === EVENT_TYPE)
      await this.process(event as SendLineNotifyEvent);
    await super.handleEvent(eventType, event);
  }

  public async process(event: SendLineNotifyEvent) {
    await this.MessageService.appendPendingMessage(
      [event.token],
      [event.message]
    );
  }
}
