import { MongoClient, Db } from "mongodb";

abstract class MongoRepository {
  protected database: Db;
  constructor(mongoClient: MongoClient) {
    this.database = mongoClient.db("Line-Notify-Sender");
  }
}

export { MongoRepository };
