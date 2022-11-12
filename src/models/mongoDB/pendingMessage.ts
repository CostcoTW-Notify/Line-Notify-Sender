export enum pendingStatus {
  Pending = 0,
  Finished = 1,
  Dropped = 2,
}

export interface LineNotifyPendingMessage {
  roomToken: string;
  message: string;
  pendingStatus: pendingStatus;
  createTime: Date;
  updateTime?: Date;
}
