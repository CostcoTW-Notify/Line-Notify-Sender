import {
  pendingStatus,
  LineNotifyPendingMessage,
} from "@/models/mongoDB/pendingMessage";
import { LineNotifyMessageRepository } from "@/repositories/lineNotifyMessageRepository";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";

interface PendingMessageResult {
  Status: boolean;
  SuccessCount: number;
  FailCount: number;
  DropCount: number;
}

interface IMessageService {
  processPendingMessage(): Promise<PendingMessageResult>;
  appendPendingMessage(tokens: string[], messages: string[]): Promise<boolean>;
}

export class MessageService implements IMessageService {
  lineNotifyRepository: LineNotifyMessageRepository;
  lineNotifyService: LineNotifyApiService;
  constructor(
    messageRepo: LineNotifyMessageRepository,
    notifyService: LineNotifyApiService
  ) {
    this.lineNotifyRepository = messageRepo;
    this.lineNotifyService = notifyService;
  }

  public async appendPendingMessage(tokens: string[], messages: string[]) {
    const lineNotifyMessages: LineNotifyPendingMessage[] = [];

    tokens.forEach((tk) => {
      messages.forEach((msg) => {
        lineNotifyMessages.push({
          roomToken: tk,
          message: msg,
          pendingStatus: pendingStatus.Pending,
          createTime: new Date(),
        });
      });
    });

    const result = await this.lineNotifyRepository.createMany(
      lineNotifyMessages
    );
    return result;
  }

  /**
   * processPendingMessage
   */
  public async processPendingMessage() {
    const pendingMsg = await this.lineNotifyRepository.getMessage(
      { pendingStatus: pendingStatus.Pending },
      { createTime: 1 }
    );
    let tasks: Promise<boolean>[] = [];

    pendingMsg.forEach((msg) => {
      let promise = this.lineNotifyService.sendMessageToChatRoom(
        msg.roomToken,
        msg.message
      );
      tasks.push(promise);
    });

    let results = await Promise.all(tasks);

    const successList: string[] = [];
    const dropList: string[] = [];
    const failList: string[] = [];

    const dropTime = new Date();
    dropTime.setDate(dropTime.getDate() - 1);

    for (let idx = 0; idx < results.length; idx++) {
      const result = results[idx];
      if (result) successList.push(pendingMsg[idx]._id.toString());
      else if (pendingMsg[idx].createTime < dropTime)
        dropList.push(pendingMsg[idx]._id.toString());
      else failList.push(pendingMsg[idx]._id.toString());
    }

    if (successList.length > 0)
      await this.lineNotifyRepository.bulkUpdateMessageStatus(
        successList,
        pendingStatus.Finished
      );

    if (dropList.length > 0) {
      await this.lineNotifyRepository.bulkUpdateMessageStatus(
        dropList,
        pendingStatus.Dropped
      );

      console.log("Drop below message cause send fail and message is expired:");
      dropList.forEach((id) => {
        console.log(`MessageId: ${id}`);
      });
    }

    return {
      SuccessCount: successList.length,
      FailCount: failList.length,
      DropCount: dropList.length,
    } as PendingMessageResult;
  }
}
