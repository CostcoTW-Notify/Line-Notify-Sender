import { pendingStatus } from "@/models/pendingMessage";
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

  /**
   * processPendingMessage
   */
  public async processPendingMessage() {
    let allPendingMsg = await this.lineNotifyRepository.getAllPendingMessage();
    if (allPendingMsg.length === 0)
      return {
        Status: false,
      } as PendingMessageResult;

    let tasks: Promise<boolean>[] = [];

    allPendingMsg.forEach((msg) => {
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
      if (result) successList.push(allPendingMsg[idx]._id.toString());
      else if (allPendingMsg[idx].createTime < dropTime)
        dropList.push(allPendingMsg[idx]._id.toString());
      else failList.push(allPendingMsg[idx]._id.toString());
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
