import { MessageService } from "@/services/messageService";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";
import { LineNotifyMessageRepository } from "@/repositories/lineNotifyMessageRepository";
import { ObjectId, WithId } from "mongodb";
import {
  LineNotifyPendingMessage,
  pendingStatus,
} from "@/models/pendingMessage";

jest.mock("@/repositories/mongoDB");
jest.mock("@/services/lineNotifyService");
const mock_mongo = LineNotifyMessageRepository as jest.MockedClass<
  typeof LineNotifyMessageRepository
>;
const mock_lineService = LineNotifyApiService as jest.MockedClass<
  typeof LineNotifyApiService
>;

describe("services/pendingMessageServices.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test("processPendingMessage will fetch data from mongoDB", async () => {
    const service = new MessageService();

    const repo = mock_mongo.mock.instances[0];
    const lineService = mock_lineService.mock.instances[0];
    const mock_sendMsg = lineService.sendMessageToChatRoom as jest.Mock;
    const mock_getMsg = repo.getAllPendingMessage as jest.Mock;
    const mock_updateMsg = repo.updatePendingMessageStatus as jest.Mock;

    mock_getMsg.mockResolvedValue([]);

    await service.processPendingMessage();

    expect(mock_getMsg).toHaveBeenCalled();
    expect(mock_sendMsg).not.toHaveBeenCalled();
    expect(mock_updateMsg).not.toHaveBeenCalled();
  });

  test("processPendingMessage will call sendMessageToChatRoom", async () => {
    const service = new MessageService();

    const repo = mock_mongo.mock.instances[0];
    const lineService = mock_lineService.mock.instances[0];
    const mock_sendMsg = lineService.sendMessageToChatRoom as jest.Mock;
    const mock_getMsg = repo.getAllPendingMessage as jest.Mock;
    const mock_updateMsg = repo.updatePendingMessageStatus as jest.Mock;

    const token1 = "token11111111";
    const message1 = "msg111111";
    const token2 = "token2_token2";
    const message2 = "msg2_msg2";
    mock_getMsg.mockResolvedValue([
      {
        _id: new ObjectId(),
        roomToken: token1,
        message: message1,
        createTime: new Date(),
        pendingStatus: pendingStatus.Pending,
      },
      {
        _id: new ObjectId(),
        roomToken: token2,
        message: message2,
        createTime: new Date(),
        pendingStatus: pendingStatus.Pending,
      },
    ]);
    mock_sendMsg.mockResolvedValue(true);

    await service.processPendingMessage();

    expect(mock_getMsg).toHaveBeenCalled();
    expect(mock_sendMsg).toHaveBeenNthCalledWith(1, token1, message1);
    expect(mock_sendMsg).toHaveBeenNthCalledWith(2, token2, message2);
    expect(mock_updateMsg).toHaveBeenCalledTimes(1);
  });

  test("processPendingMessage will update pending message status", async () => {
    const service = new MessageService();

    const repo = mock_mongo.mock.instances[0];
    const lineService = mock_lineService.mock.instances[0];
    const mock_sendMsg = lineService.sendMessageToChatRoom as jest.Mock;
    const mock_getMsg = repo.getAllPendingMessage as jest.Mock;
    const mock_updateMsg = repo.updatePendingMessageStatus as jest.Mock;

    const id1 = new ObjectId("111111111111111111111111");
    const id2 = new ObjectId("222222222222222222222222");
    const id3 = new ObjectId("333333333333333333333333");
    const id4 = new ObjectId("444444444444444444444444");
    const today = new Date();
    const date1 = new Date();
    const date2 = new Date();
    const date3 = new Date();
    const date4 = new Date();

    date1.setDate(today.getDate() - 2); // -2 day
    date2.setTime(today.getTime() - 12 * 60 * 60 * 1000); // -12 hr
    date3.setTime(today.getTime() - 30 * 60 * 1000); // -30 mins
    date4.setTime(today.getTime() - 30 * 60 * 60 * 1000); // -30 hr
    mock_getMsg.mockImplementation(() => [
      {
        _id: id1,
        createTime: date1,
        pendingStatus: pendingStatus.Pending,
      },
      {
        _id: id2,
        createTime: date2,
        pendingStatus: pendingStatus.Pending,
      },
      {
        _id: id3,
        createTime: date3,
        pendingStatus: pendingStatus.Pending,
      },
      {
        _id: id4,
        createTime: date4,
        pendingStatus: pendingStatus.Pending,
      },
    ]);

    mock_sendMsg
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockImplementation(() => false);

    await service.processPendingMessage();

    expect(mock_getMsg).toHaveBeenCalled();
    expect(mock_sendMsg).toHaveBeenCalledTimes(4);
    expect(mock_updateMsg).toHaveBeenCalledWith(
      [id1, id2],
      pendingStatus.Finished
    );
    expect(mock_updateMsg).toHaveBeenCalledWith([id4], pendingStatus.Dropped);
  });
});
