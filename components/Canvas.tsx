import { Message } from "../types.ts";
import { Position } from "../utils/db.ts";
import { Chara } from "../components/Chara.tsx";

export function Canvas(
  { positions, onClick, messages }: {
    positions: Record<string, Position>;
    messages: Message[];
    onClick: (e: MouseEvent) => void;
  },
) {
  return (
    <svg class="bg-white" width={1200} height={600} onClick={onClick}>
      <image href="/crop.png" x={-10} y={-10} width={1220} height={620} />

      {Object.entries(positions).slice().sort((a, b) => {
        return a[1].y - b[1].y;
      }).map(([uid, position]) => (
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

      <g transform="translate(0, 370)">
        <rect
          x={0}
          y={0}
          width={300}
          height={300}
          fill="rgba(0, 0, 0, 0.5)"
          rx={10}
          ry={10}
        />
        {Object.entries(messages).slice().reverse().slice(0, 10).reverse().map((
          [index, message],
          idx,
        ) => (
          <text
            x={10}
            y={20 * (idx + 1) + 10}
            fill="white"
            font-size="13"
            opacity={idx * 0.1 + 0.2}
          >
            <tspan fill="#AAF">{message.username}</tspan> {message.body}
          </text>
        ))}
      </g>
    </svg>
  );
}
