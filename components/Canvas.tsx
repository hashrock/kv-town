import { Message } from "../types.ts";
import { Position } from "../utils/db.ts";
import { Chara } from "../components/Chara.tsx";
import { JSX } from "preact";

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

export function Canvas(
  { positions, onClick, messages }: {
    positions: Record<string, Position>;
    messages: Message[];
    onClick: (e: MouseEvent) => void;
  },
) {
  const characters = Object.entries(positions).slice();
  const zSorted = characters.sort((a, b) => {
    return a[1].y - b[1].y;
  });

  return (
    <svg class="bg-white" width={1200} height={600} onClick={onClick}>
      <image href="/crop.png" x={-10} y={-10} width={1220} height={620} />

      {zSorted.map(([uid, position]) => (
        <Chara
          key={uid}
          x={position.x}
          y={position.y}
          username={position.username}
          messages={messages}
          uid={uid}
          color={position.color}
        />
      ))}

      <MessageBox messages={messages} transform="translate(0, 370)" />
    </svg>
  );
}
