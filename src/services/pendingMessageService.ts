import { pendingStatus } from "@/models/pendingMessage";
import { MongoRepository } from "@/repositories/mongoDB";
import { LineNotifyService } from "@/services/lineNotifyService";
import { ObjectId } from "mongodb";

export class PendingMessageService {
  mongoRepo: MongoRepository;
  lineNotifyService: LineNotifyService;
  constructor() {
    this.mongoRepo = new MongoRepository();
    this.lineNotifyService = new LineNotifyService();
  }
  /**
   * processPendingMessage
   */
  public async processPendingMessage(): Promise<void> {
    let allPendingMsg = await this.mongoRepo.getAllPendingMessage();
    if (allPendingMsg.length === 0) return;

    let tasks: Promise<boolean>[] = [];

    allPendingMsg.forEach((msg) => {
      let promise = this.lineNotifyService.sendMessageToChatRoom(
        msg.roomToken,
        msg.message
      );
      tasks.push(promise);
    });

    let results = await Promise.all(tasks);

    let successList: ObjectId[] = [];
    let dropList: ObjectId[] = [];
    const dropTime = new Date();
    dropTime.setDate(dropTime.getDate() - 1);
    for (let idx = 0; idx < results.length; idx++) {
      const result = results[idx];
      if (result) successList.push(allPendingMsg[idx]._id);
      else if (allPendingMsg[idx].createTime < dropTime)
        dropList.push(allPendingMsg[idx]._id);
    }

    if (successList.length > 0)
      await this.mongoRepo.updatePendingMessageStatus(
        successList,
        pendingStatus.Finished
      );

    if (dropList.length > 0) {
      await this.mongoRepo.updatePendingMessageStatus(
        dropList,
        pendingStatus.Dropped
      );
      console.log("Drop below message cause send fail and message is expired:");
      dropList.forEach((x) => {
        console.log(x);
      });
    }
  }
}
