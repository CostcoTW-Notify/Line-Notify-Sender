import { MongoClient, Db } from "mongodb";

abstract class MongoRepository {
  protected database: Db;
  constructor(connectionString: string) {
    const client = new MongoClient(connectionString);
    this.database = client.db("Line-Notify-Sender");
  }
}

export { MongoRepository };
