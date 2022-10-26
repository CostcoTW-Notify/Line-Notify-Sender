import axios, { AxiosError } from "axios";
import { LineNotifyRoomStatus } from "@/models/lineNotifyModel";

const sendMsg_url = "https://notify-api.line.me/api/notify";
const getTokenStatus_url = "https://notify-api.line.me/api/status";
const revokeToken_url = "https://notify-api.line.me/api/revoke";

export class LineNotifyService {
  public async sendMessageToChatRoom(token: string, message: string) {
    const params = new URLSearchParams();
    params.append("message", message);
    try {
      let result = await axios.post<LineNotifyRoomStatus>(sendMsg_url, params, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return true;
    } catch (e) {
      let error = e as AxiosError;
      let response = error.response?.data as LineNotifyRoomStatus;
      console.log("Send message to ChatRoom fail... ");
      console.log(response);
      return false;
    }
  }

  public async fetchChatRoomStatus(
    token: string
  ): Promise<LineNotifyRoomStatus> {
    try {
      let result = await axios.get<LineNotifyRoomStatus>(getTokenStatus_url, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return result.data;
    } catch (e) {
      let error = e as AxiosError;
      let response = error.response?.data as LineNotifyRoomStatus;
      console.log("fetch status from Line API fail...");
      console.log(response);
      return response;
    }
  }

  public async revokeChatRoomToken(token: string): Promise<boolean> {
    try {
      let result = await axios.post<LineNotifyRoomStatus>(
        revokeToken_url,
        new URLSearchParams(),
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      return true;
    } catch (e) {
      let error = e as AxiosError;
      let response = error.response?.data as LineNotifyRoomStatus;
      console.log("Send request to revoke url fail... ");
      console.log(response);
      return false;
    }
  }
}
