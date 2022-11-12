import {
  LineNotifyPendingMessage,
  pendingStatus,
} from "@/models/pendingMessage";
import { MongoRepository } from "./mongoRepository";
import { Collection, WithId, ObjectId } from "mongodb";

interface ILineNotifyMessageRepository {
  getAllPendingMessage(): Promise<WithId<LineNotifyPendingMessage>[]>;

  getMessage(query: any): Promise<WithId<LineNotifyPendingMessage>[]>;

  createMessage(message: LineNotifyPendingMessage): Promise<boolean>;

  updateMessage(message: WithId<LineNotifyPendingMessage>): Promise<void>;

  bulkUpdateMessageStatus(
    ids: string[],
    newStatus: pendingStatus
  ): Promise<boolean>;
}

export class LineNotifyMessageRepository
  extends MongoRepository
  implements ILineNotifyMessageRepository
{
  protected lineNotifyCollection: Collection<LineNotifyPendingMessage>;

  constructor(connectionString: string) {
    super(connectionString);
    this.lineNotifyCollection =
      this.database.collection<LineNotifyPendingMessage>("LineNotifyMessage");
  }

  public async getMessage(
    query: any
  ): Promise<WithId<LineNotifyPendingMessage>[]> {
    const result = await this.lineNotifyCollection.find(query).toArray();
    return result;
  }

  public async createMessage(
    message: LineNotifyPendingMessage
  ): Promise<boolean> {
    const result = await this.lineNotifyCollection.insertOne(message);
    return result.acknowledged;
  }

  public async updateMessage(
    message: WithId<LineNotifyPendingMessage>
  ): Promise<void> {
    const result = await this.lineNotifyCollection.replaceOne(
      { _id: message._id },
      message
    );
    return result.acknowledged;
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

  public async bulkUpdateMessageStatus(
    ids: string[],
    newStatus: pendingStatus
  ): Promise<boolean> {
    await this.lineNotifyCollection.findOne(); // Make sure collection is already connect.
    let updateDate = new Date();
    let bulk = this.lineNotifyCollection.initializeUnorderedBulkOp();
    ids.forEach((id) =>
      bulk.find({ _id: new ObjectId(id) }).updateOne({
        $set: { pendingStatus: newStatus, updateTime: updateDate },
      })
    );
    let result = await bulk.execute();
    return result.isOk();
  }
}
