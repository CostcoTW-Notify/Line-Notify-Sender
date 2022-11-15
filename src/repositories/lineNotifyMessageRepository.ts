import {
  LineNotifyPendingMessage,
  pendingStatus,
} from "@/models/mongoDB/pendingMessage";
import { MongoRepository } from "./mongoRepository";
import { Collection, WithId, ObjectId, MongoClient } from "mongodb";

interface ILineNotifyMessageRepository {
  getMessage(
    query: any,
    sort?: any | undefined
  ): Promise<WithId<LineNotifyPendingMessage>[]>;

  createOne(message: LineNotifyPendingMessage): Promise<boolean>;

  createMany(messages: LineNotifyPendingMessage[]): Promise<boolean>;

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

  constructor(mongoClient: MongoClient) {
    super(mongoClient);
    this.lineNotifyCollection =
      this.database.collection<LineNotifyPendingMessage>("LineNotifyMessage");
  }

  public async getMessage(
    query: any,
    sort?: any | undefined
  ): Promise<WithId<LineNotifyPendingMessage>[]> {
    let search = this.lineNotifyCollection.find(query);
    if (sort != null) search = search.sort(sort);

    const result = await search.toArray();
    return result;
  }

  public async createOne(message: LineNotifyPendingMessage): Promise<boolean> {
    const result = await this.lineNotifyCollection.insertOne(message);
    return result.acknowledged;
  }

  public async createMany(
    messages: LineNotifyPendingMessage[]
  ): Promise<boolean> {
    const result = await this.lineNotifyCollection.insertMany(messages);
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
