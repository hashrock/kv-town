/**
 * This module implements the DB layer for the Tic Tac Toe game. It uses Deno's
 * key-value store to store data, and uses BroadcastChannel to perform real-time
 * synchronization between clients.
 */

import { Message } from "../types.ts";
import { uuidv7 } from "https://esm.sh/uuidv7@0.4.3";

const kv = await Deno.openKv();

export async function listMessage() {
  const iter = await kv.list<Message>(
    { prefix: ["message"] },
    {
      reverse: true,
      limit: 10,
    }
  );
  const message: Message[] = [];
  for await (const item of iter) {
    message.push(item.value);
  }
  return message;
}

export async function getMessage(id: string) {
  const res = await kv.get<Message>(["message", id]);
  return res.value;
}

export async function addMessage(uid: string, username: string, body: string) {
  const id = uuidv7();
  const ts = Date.now();
  const message: Message = {
    id,
    uid,
    username,
    body,
    ts,
  };
  await kv.set(["message", ts], message);
  return id;
}

export async function deleteMessage(ts: number) {
  await kv.delete(["message", ts]);
}

export async function listRoomObject() {
  const iter = await kv.list<RoomObject>(
    { prefix: ["room_object"] },
    {
      reverse: true,
      limit: 100,
    }
  );
  const roomObject: RoomObject[] = [];
  for await (const item of iter) {
    roomObject.push(item.value);
  }
  return roomObject;
}

export async function getRoomObject(id: string) {
  const res = await kv.get<RoomObject>(["room_object", id]);
  return res.value;
}

export async function addRoomObject(
  uid: string,
  x: number,
  y: number,
  name: string,
  size: number
) {
  const id = uuidv7();
  const ts = Date.now();
  const roomObject: RoomObject = {
    id,
    uid,
    x,
    y,
    name,
    ts,
    size,
  };
  await kv.set(["room_object", id], roomObject);
  return id;
}

export async function removeAllRoomObject() {
  const iter = await kv.list<RoomObject>({ prefix: ["room_object"] });
  for await (const item of iter) {
    await kv.delete(["room_object", item.value.id]);
  }
}

export async function removeRoomObject(id: string) {
  await kv.delete(["room_object", id]);
}

export interface RoomObject {
  id: string;
  uid: string;
  x: number;
  y: number;
  name: string;
  ts: number;
  size: number;
}

export interface Position {
  uid: string;
  x: number;
  y: number;
  ts: number;
  username: string;
  color: string;
}

export async function updatePosition(position: Position) {
  await kv.set(["position", position.uid], position);
}

export async function getPosition() {
  const iter = await kv.list<Position>({ prefix: ["position"] });
  const position: { [uid: string]: Position } = {};
  for await (const item of iter) {
    position[item.value.uid] = item.value;
  }
  return position;
}
