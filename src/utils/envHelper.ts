export default class EnvHelper {
  public static GetMongoConnectionString(): string {
    let conn_str = process.env.mongo_conn_str;
    return conn_str!;
  }
}
