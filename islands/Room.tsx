import { useEffect, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { BroadcastMessage, Message, MoveMesssage } from "../types.ts";
import { Position, RoomObject } from "../utils/db.ts";
import { Canvas } from "../components/Canvas.tsx";
import {
  addRoomObject,
  getRoomMessage,
  getRoomObjects,
  getRoomPositions,
  move,
  sendMessage,
} from "../utils/api.ts";
import {
  emojiUrl,
  emojiUrlCodePoint,
  randomColor,
  randomRange,
} from "../utils/room_utils.ts";
import * as emoji from "../utils/emoji.ts";
enum ConnectionState {
  Connecting,
  Connected,
  Disconnected,
}

const expire = 60000;
const emojis = {
  lg: emoji.emoji_building,
  md: emoji.emoji_car,
  sm: [...emoji.emoji_flower, ...emoji.emoji_food],
};
export default function Chat() {
  const connectionState = useSignal(ConnectionState.Disconnected);
  const messages = useSignal<Message[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [myColor] = useState(randomColor());
  const [roomObjects, setRoomObjects] = useState<RoomObject[]>([]);
  const [myX, setMyX] = useState(0);
  const [myY, setMyY] = useState(0);

  useEffect(() => {
    const events = new EventSource("/api/listen");
    events.addEventListener(
      "open",
      () => connectionState.value = ConnectionState.Connected,
    );
    events.addEventListener("error", () => {
      switch (events.readyState) {
        case EventSource.OPEN:
          connectionState.value = ConnectionState.Connected;
          break;
        case EventSource.CONNECTING:
          connectionState.value = ConnectionState.Connecting;
          break;
        case EventSource.CLOSED:
          connectionState.value = ConnectionState.Disconnected;
          break;
      }
    });
    events.addEventListener("message", (e) => {
      const message: BroadcastMessage = JSON.parse(e.data);
      if (message.type === "move") {
        const payload = message.payload as MoveMesssage;
        const item: Position = {
          username: message.username,
          x: payload.x,
          y: payload.y,
          uid: message.uid,
          ts: message.ts,
          color: payload.color,
        };
        setPositions((positions) => ({
          ...positions,
          [message.uid]: item,
        }));
      }
      if (message.type === "message") {
        const payload = message.payload as Message;
        messages.value = [...messages.value, payload];
      }
      if (message.type === "room_object") {
        const payload = message.payload as RoomObject;
        setRoomObjects((roomObjects) => [...roomObjects, payload]);
      }
    });

    (async () => {
      const mx = randomRange(100, 1100);
      const my = randomRange(100, 500);
      setMyX(mx);
      setMyY(my);

      await move(
        mx,
        my,
        myColor,
      );
      messages.value = [...messages.value, ...await getRoomMessage()];

      const d_room = await getRoomPositions();

      // remove expired positions
      const now = Date.now();
      Object.entries(d_room).forEach(([uid, position]) => {
        const p = position as Position;
        if (now - p.ts > expire) {
          delete d_room[uid];
        }
      });

      setPositions(d_room);

      const ro = await getRoomObjects();
      setRoomObjects(ro);
    })();

    return () => events.close();
  }, []);

  const sizeDict: Record<string, number> = {
    lg: 120,
    md: 80,
    sm: 50,
  };

  return (
    <div class="w-full">
      <Canvas
        positions={positions}
        messages={messages.value}
        roomObjects={roomObjects}
        onClick={(e) => {
          const rect = (e.currentTarget as SVGSVGElement)
            .getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          setMyX(x);
          setMyY(y);

          move(x, y, myColor);
        }}
      />
      <SendMessageForm />
      {Object.entries(emojis).map(([size, emojiList]) => (
        <div class="gap-2 py-4 justify-center">
          {emojiList.map((emoji) => (
            <button
              class="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              onClick={() => {
                addRoomObject(myX, myY, emoji, sizeDict[size]);
              }}
            >
              <img src={emojiUrl(emoji)} class="w-12 h-12" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function SendMessageForm() {
  const message = useSignal("");

  const onSubmit = (e: Event) => {
    e.preventDefault();
    if (message.value.length === 0) return;

    sendMessage(message.value).then(() => message.value = "");
  };

  return (
    <form class="flex gap-2 py-4 justify-center" onSubmit={onSubmit}>
      <input
        class="border border-gray-300 rounded px-2 py-1 w-[400px]"
        type="text"
        value={message.value}
        onInput={(e) => message.value = e.currentTarget.value}
      />
      <button type="Submit" class="bg-gray-900 text-white px-4 py-3 rounded">
        Send Message
      </button>
    </form>
  );
}
