import { Message } from "../types.ts";
import { Position, RoomObject } from "../utils/db.ts";
import { Chara } from "../components/Chara.tsx";
import { JSX } from "preact";
import { useState } from "preact/hooks";
import { ConnectionState } from "../islands/Room.tsx";
import { objectImages } from "🛠️/objects.ts";

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
        fill="rgba(0, 100, 100, 0.5)"
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
  {
    positions,
    onClick,
    messages,
    roomObjects,
    onClickRoomObject,
    connectionState,
  }: {
    positions: Record<string, Position>;
    roomObjects: RoomObject[];
    messages: Message[];
    connectionState: ConnectionState;
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

  const connectionColor = connectionState === ConnectionState.Connected
    ? "#8F8"
    : "#F88";

  return (
    <svg
      class="w-full h-full cursor-crosshair rounded-xl border-2 border-green-400"
      width={1200}
      height={600}
      onClick={onClick}
      viewBox="0 0 1200 600"
    >
      <image href="/crop3.png" x={-10} y={-10} width={1220} height={620} />

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
          return (
            <RoomObjectEl
              key={i.roomObject.id}
              roomObject={i.roomObject}
              onDelete={onClickRoomObject}
            />
          );
        }

        return null;
      })}

      <MessageBox messages={messages} transform="translate(0, 370)" />
      <g transform="translate(20, 20)">
        <circle fill={connectionColor} cx={0} cy={-2} r={4} />
        (
        <text
          x={10}
          y={0}
          fill={connectionColor}
          font-size="13"
          font-family="sans-serif"
          text-anchor="start"
          alignment-baseline="middle"
        >
          {connectionState === ConnectionState.Connecting
            ? "Connecting..."
            : connectionState === ConnectionState.Connected
            ? "OK"
            : "Disconnected"}
        </text>
        )
      </g>
    </svg>
  );
}

interface RoomObjectElProps extends JSX.SVGAttributes<SVGGElement> {
  roomObject: RoomObject;
  onDelete: (id: string) => void;
}
function RoomObjectEl(props: RoomObjectElProps) {
  const { roomObject, onDelete } = props;
  const size = roomObject.size;
  const [hover, setHover] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

  const isContainedImageList = objectImages.map((i) => i.name).includes(
    roomObject.name,
  );
  const url = isContainedImageList
    ? `obj/${roomObject.name}.png`
    : emojiUrl(roomObject.name);

  return (
    <g
      key={roomObject.id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <image
        key={roomObject.id}
        href={url}
        x={roomObject.x - size / 2}
        y={roomObject.y - size / 2}
        width={size}
        height={size}
      />
      {hover && (
        <g>
          <rect
            x={roomObject.x - size / 2}
            y={roomObject.y - size / 2}
            width={size}
            height={size}
            fill="rgba(0, 0, 0, 0.1)"
            rx={10}
            ry={10}
          />
          <rect
            x={roomObject.x - 100 / 2}
            y={roomObject.y - 32 / 2}
            width={100}
            height={32}
            fill="rgba(0, 0, 0, 0.5)"
            opacity={isConfirm ? 1 : 0.5}
            class="cursor-pointer"
            rx={10}
            ry={10}
            onClick={(e) => {
              e.stopPropagation();
              if (isConfirm) {
                onDelete(roomObject.id);
                setIsConfirm(false);
              } else {
                setIsConfirm(true);
              }
            }}
          >
          </rect>

          <text
            x={roomObject.x}
            y={roomObject.y}
            fill="white"
            font-size="13"
            text-anchor="middle"
            alignment-baseline="middle"
            class="pointer-events-none select-none"
          >
            {isConfirm ? "OK?" : "Remove"}
          </text>
        </g>
      )}
    </g>
  );
}
