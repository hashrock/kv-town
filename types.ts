export interface Message {
  id: string;
  body: string;
  ts: number;
  uid: string;
  username: string;
}

export interface BroadcastMessage {
  type: "message" | "move" | "room_object" | "room_object_delete";
  payload: Message | MoveMesssage | RoomObjectMessage | RoomObjectDeleteMessage;
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
  size: number;
}

export interface RoomObjectDeleteMessage {
  id: string;
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
