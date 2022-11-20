import { LineNotifyApiService } from "@/services/lineNotifyApiService";
import axios from "axios";

describe("service/lineNotifyService.ts", () => {
  test("sendMessageToChatRoom will call line api", async () => {
    let mockPost = jest.fn();
    axios.post = mockPost;
    const service = new LineNotifyApiService();

    // Action
    await service.sendMessageToChatRoom("token", "this is message");

    // Assert
    expect(mockPost).toHaveBeenCalledTimes(1);

    expect(mockPost.mock.lastCall[0]).toBe(
      "https://notify-api.line.me/api/notify"
    );

    expect(mockPost.mock.lastCall[1].toString()).toBe(
      "message=this+is+message"
    );

    expect(mockPost.mock.lastCall[2]).toEqual(
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      })
    );
  });
});
