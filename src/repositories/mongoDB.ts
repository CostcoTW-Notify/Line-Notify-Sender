import {
  LineNotifyPendingMessage,
  pendingStatus,
} from "@/models/pendingMessage";
import { MongoClient, Collection, WithId, ObjectId } from "mongodb";

export class MongoRepository {
  public lineNotifyCollection: Collection<LineNotifyPendingMessage>;

  constructor() {
    let conn_str = process.env.mongo_conn_str;
    let message_collection = process.env.line_notify_message;
    if (conn_str === undefined) throw "env: mongo_conn_str not setup...";
    if (message_collection === undefined)
      throw "env: line_notify_message not setup...";
    let mongo = new MongoClient(conn_str);
    let collection = mongo
      .db()
      .collection<LineNotifyPendingMessage>(message_collection);
    this.lineNotifyCollection = collection;
  }

  public async getAllPendingMessage(): Promise<
    WithId<LineNotifyPendingMessage>[]
  > {
    let result = await this.lineNotifyCollection
      .find({
        pendingStatus: pendingStatus.Pending,
      } as LineNotifyPendingMessage)
      .toArray();
    return result;
  }

  public async updatePendingMessageStatus(
    ids: ObjectId[],
    newStatus: pendingStatus
  ): Promise<boolean> {
    await this.lineNotifyCollection.findOne(); // Make sure collection is already connect.
    let updateDate = new Date();
    let bulk = this.lineNotifyCollection.initializeUnorderedBulkOp();
    ids.forEach((id) =>
      bulk.find({ _id: id }).updateOne({
        $set: { pendingStatus: newStatus, updateTime: updateDate },
      })
    );
    let result = await bulk.execute();
    return result.isOk();
  }
}
