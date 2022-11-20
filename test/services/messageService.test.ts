import { MessageService } from "@/services/messageService";
import { LineNotifyMessageRepository } from "@/repositories/lineNotifyMessageRepository";
import { LineNotifyApiService } from "@/services/lineNotifyApiService";
import { measureMemory } from "vm";
import { pendingStatus } from "@/models/mongoDB/pendingMessage";

describe("services/messageService.ts", () => {
  test("test appendPendingMessage will expand all token and message", async () => {
    const messageRepo = jest.fn() as unknown as LineNotifyMessageRepository;
    const notifyService = jest.fn() as unknown as LineNotifyApiService;
    messageRepo.createMany = jest.fn();
    const service = new MessageService(messageRepo, notifyService);

    // Action
    await service.appendPendingMessage(
      ["token1", "token2"],
      ["message1", "message2"]
    );

    // Assert
    expect(messageRepo.createMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          roomToken: "token1",
          message: "message1",
        }),
        expect.objectContaining({
          roomToken: "token1",
          message: "message2",
        }),
        expect.objectContaining({
          roomToken: "token2",
          message: "message1",
        }),
        expect.objectContaining({
          roomToken: "token2",
          message: "message2",
        }),
      ])
    );
  });

  test("test processPendingMessage will send all message any update status to repo", async () => {
    const messageRepo = jest.fn() as unknown as LineNotifyMessageRepository;
    const notifyService = jest.fn() as unknown as LineNotifyApiService;

    const mockGetMessage = jest.fn();

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setTime(yesterday.getTime() - 100);
    mockGetMessage.mockReturnValue([
      // Success - Update done
      {
        _id: "00001",
        roomToken: "Token1",
        message: "message1",
        createTime: new Date(),
      },
      // Success - Update done
      {
        _id: "00002",
        roomToken: "Token1",
        message: "message2",
        createTime: yesterday,
      },
      // Fail - still pending
      {
        _id: "00003",
        roomToken: "Token2",
        message: "message1",
        createTime: new Date(),
      },
      // Fail - drop
      {
        _id: "00004",
        roomToken: "Token2",
        message: "message1",
        createTime: yesterday,
      },
    ]);
    messageRepo.getMessage = mockGetMessage;
    messageRepo.bulkUpdateMessageStatus = jest.fn();
    const mockSend = jest.fn();
    mockSend
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    notifyService.sendMessageToChatRoom = mockSend;

    const service = new MessageService(messageRepo, notifyService);

    // Action
    await service.processPendingMessage();

    // Assert
    expect(notifyService.sendMessageToChatRoom).toHaveBeenCalledTimes(4);
    expect(messageRepo.bulkUpdateMessageStatus).toHaveBeenCalledWith(
      ["00001", "00002"],
      pendingStatus.Finished
    );
    expect(messageRepo.bulkUpdateMessageStatus).toHaveBeenCalledWith(
      ["00004"],
      pendingStatus.Dropped
    );
  });
});
