import { Message } from "../types.ts";
import { Position, RoomObject } from "../utils/db.ts";
import { Chara } from "../components/Chara.tsx";
import { JSX } from "preact";
import { emojiUrl } from "../utils/room_utils.ts";

interface MessageBoxProps extends JSX.SVGAttributes<SVGGElement> {
  messages: Message[];
}

function MessageBox({ messages, transform }: MessageBoxProps) {
  const displayMax = 10;
  const recentMessages = Object.entries(messages).slice().reverse().slice(
    0,
    displayMax,
  );

  const height = 300;
  const width = 300;

  return (
    <g transform={transform}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.5)"
        rx={10}
        ry={10}
      />
      {recentMessages.map((
        [index, message],
        idx,
      ) => (
        <text
          x={10}
          y={height - 20 * (idx + 1) - 66}
          fill="white"
          font-size="13"
          opacity={(displayMax - idx) * 0.1 + 0.2}
        >
          <tspan fill="#AAF">{message.username}</tspan> {message.body}
        </text>
      ))}
    </g>
  );
}

interface DisplayObject {
  y: number;
  type: "position" | "roomObject";
  position?: Position;
  roomObject?: RoomObject;
}

export function Canvas(
  { positions, onClick, messages, roomObjects, onClickRoomObject }: {
    positions: Record<string, Position>;
    roomObjects: RoomObject[];
    messages: Message[];
    onClick: (e: MouseEvent) => void;
    onClickRoomObject: (id: string) => void;
  },
) {
  const characters = Object.values(positions).slice().map(
    (i): DisplayObject => {
      return {
        y: i.y,
        type: "position",
        position: i,
      };
    },
  );
  const ros = roomObjects.slice().map((i): DisplayObject => {
    return {
      y: i.y,
      type: "roomObject",
      roomObject: i,
    };
  });
  const zSorted = characters.concat(ros).sort((a, b) => a.y - b.y);

  return (
    <svg class="bg-white" width={1200} height={600} onClick={onClick}>
      <image href="/crop.png" x={-10} y={-10} width={1220} height={620} />

      {zSorted.map((i) => {
        if (i.position) {
          return (
            <Chara
              key={i.position?.uid}
              uid={i.position?.uid}
              x={i.position?.x}
              y={i.position?.y}
              username={i.position?.username}
              messages={messages}
              color={i.position?.color}
            />
          );
        }

        if (i.roomObject) {
          const url = emojiUrl(i.roomObject.name);
          const size = i === undefined ? 25 : i.roomObject.size;
          return (
            <g>
              <image
                key={i.roomObject.id}
                href={url}
                x={i.roomObject.x - size / 2}
                y={i.roomObject.y - size / 2}
                width={size}
                height={size}
                onClick={(e) => {
                  e.stopPropagation();
                  const id = i.roomObject?.id;
                  if (id !== undefined) {
                    onClickRoomObject(id);
                  }
                }}
              />
            </g>
          );
        }

        return null;
      })}

      <MessageBox messages={messages} transform="translate(0, 370)" />
    </svg>
  );
}
