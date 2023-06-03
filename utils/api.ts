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

export function sendMessage(msg: string) {
  return fetch("/api/send", {
    method: "POST",
    body: JSON.stringify({
      body: msg,
    }),
  });
}

export function addRoomObject(
  x: number,
  y: number,
  name: string,
  size: number
) {
  return fetch("/api/room_object", {
    method: "POST",
    body: JSON.stringify({
      x,
      y,
      name,
      size,
    }),
  });
}

export function getRoomObjects() {
  return fetch("/api/room_object").then((r) => r.json());
}

export function deleteRoomObject(id: string) {
  return fetch("/api/room_object", {
    method: "DELETE",
    body: JSON.stringify({
      id,
    }),
  });
}
