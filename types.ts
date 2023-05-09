export interface Message {
  id: string;
  body: string;
  ts: number;
  uid: string;
  username: string;
}

export interface BroadcastMessage {
  type: "message" | "move";
  payload: Message | MoveMesssage;
  ts: number;
  uid: string;
  username: string;
}

export interface MoveMesssage {
  x: number;
  y: number;
}
interface Avatar {
  x: number;
  y: number;
  name: string;
  uid: string;
  lastUpdate: number;
}

export interface RoomState {
  users: Avatar[];
}
