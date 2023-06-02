import { BroadcastMessage, Message, MoveMesssage } from "../types.ts";

export function move(x: number, y: number, color: string) {
  return fetch("/api/move", {
    method: "POST",
    body: JSON.stringify({
      x,
      y,
      color,
    }),
  });
}

export function getRoomMessage() {
  return fetch("/api/message")
    .then((r) => r.json())
    .then((d_messages: Message[]) => {
      d_messages.reverse();
      return d_messages;
    });
}

export function getRoomPositions() {
  return fetch("/api/room").then((r) => r.json());
}