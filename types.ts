export interface Message {
  id: string;
  body: string;
  ts: number;
  uid: string;
  username: string;
}

export interface BroadcastMessage {
  type: "message" | "move" | "room_object";
  payload: Message | MoveMesssage | RoomObjectMessage;
  ts: number;
  uid: string;
  username: string;
}

export interface MoveMesssage {
  x: number;
  y: number;
  color: string;
}

export interface RoomObjectMessage {
  x: number;
  y: number;
  name: string;
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
