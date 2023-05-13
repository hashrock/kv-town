/**
 * This module implements the DB layer for the Tic Tac Toe game. It uses Deno's
 * key-value store to store data, and uses BroadcastChannel to perform real-time
 * synchronization between clients.
 */

import { Message } from "../types.ts";

const kv = await Deno.openKv();


export async function listMessage() {
  const iter = await kv.list<Message>({ prefix: ["message"] }, {
    reverse: true,
    limit: 10,
  });
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
  const id = crypto.randomUUID();
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

export interface Position {
  uid: string;
  x: number;
  y: number;
  ts: number;
  username: string;
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
