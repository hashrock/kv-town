import { useEffect, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { BroadcastMessage, Message, MoveMesssage } from "../types.ts";
import { Position, removeAllRoomObject, RoomObject } from "../utils/db.ts";
import { Canvas } from "../components/Canvas.tsx";
import {
  addRoomObject,
  deleteRoomObject,
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
import { User } from "../utils/types.ts";
export enum ConnectionState {
  Connecting,
  Connected,
  Disconnected,
}
import IconMessageCircle2 from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/message-circle-2.tsx";

export const objectImages = [
  "building",
  "bus",
  "car",
  "house1",
  "house2",
  "plant",
  "well",
];

const expire = 60000;
const emojis = {
  lg: emoji.emoji_building,
  md: emoji.emoji_car,
  sm: [...emoji.emoji_flower, ...emoji.emoji_food],
};
export default function Chat(props: { user: User }) {
  const connectionState = useSignal(ConnectionState.Disconnected);
  const messages = useSignal<Message[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [myColor] = useState(randomColor());
  const [roomObjects, setRoomObjects] = useState<RoomObject[]>([]);
  const [myX, setMyX] = useState(0);
  const [myY, setMyY] = useState(0);
  const myUid = props.user.id;

  function moveMyself(x: number, y: number) {
    const myPosition = positions[myUid];

    setPositions((positions) => ({
      ...positions,
      [myUid]: {
        ...myPosition,
        x,
        y,
      },
    }));
  }

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

        // ignore my position update message(echo)
        if (message.uid === myUid) {
          return;
        }

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
      if (message.type === "room_object_delete") {
        const payload = message.payload as RoomObject;
        setRoomObjects((roomObjects) =>
          roomObjects.filter((ro) => ro.id !== payload.id)
        );
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

  function screenToSvg(
    point: { x: number; y: number },
    el: SVGGraphicsElement,
    svg: SVGSVGElement,
  ) {
    const pt = svg.createSVGPoint();
    pt.x = point.x;
    pt.y = point.y;
    return pt.matrixTransform(el?.getScreenCTM()?.inverse());
  }

  return (
    <div class="w-full flex flex-col">
      <Canvas
        positions={positions}
        messages={messages.value}
        roomObjects={roomObjects}
        connectionState={connectionState.value}
        onClick={(e) => {
          const rect = (e.currentTarget as SVGSVGElement)
            .getBoundingClientRect();

          const { x, y } = screenToSvg(
            { x: e.clientX, y: e.clientY },
            e.currentTarget as SVGGraphicsElement,
            e.currentTarget as SVGSVGElement,
          );

          setMyX(x);
          setMyY(y);
          moveMyself(x, y);
          move(x, y, myColor);
        }}
        onClickRoomObject={(id) => {
          deleteRoomObject(id);
        }}
      />
      <div class="flex flex-col md:flex-row gap-x-8 gap-y-2 justify-start">
        <div class="overflow-auto h-16 md:h-24">
          {objectImages.map((img) => (
            <button
              class="bg-green-100 hover:bg-green-300 px-2 py-1 rounded"
              onClick={() => {
                addRoomObject(myX, myY, img, 100);
              }}
            >
              <img src={`/obj/${img}.png`} class="w-6 h-6 md:w-8 md:h-8" />
            </button>
          ))}

          {Object.entries(emojis).map(([size, emojiList]) => (
            emojiList.map((emoji) => (
              <button
                class="bg-green-100 hover:bg-green-300 px-2 py-1 rounded"
                onClick={() => {
                  addRoomObject(myX, myY, emoji, sizeDict[size]);
                }}
              >
                <img src={emojiUrl(emoji)} class="w-6 h-6 md:w-8 md:h-8" />
              </button>
            ))
          ))}
        </div>
        <SendMessageForm />
      </div>
      <div>
        <a
          href="https://github.com/hashrock/kv-town"
          class={`text-gray-500 hover:text-gray-400 text-sm hover:underline`}
        >
          View on GitHub
        </a>
      </div>
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
      <button
        type="Submit"
        class="bg-green-700 hover:bg-green-500 text-white px-4 py-3 rounded"
      >
        <IconMessageCircle2 class="w-8 h-8" />
        Say
      </button>
    </form>
  );
}
