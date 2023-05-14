import { useEffect, useRef, useState } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { BroadcastMessage, Message, MoveMesssage } from "../types.ts";
import { Position } from "../utils/db.ts";
import { WalkDeno } from "../components/WalkDeno.tsx";

enum ConnectionState {
  Connecting,
  Connected,
  Disconnected,
}

export default function Chat() {
  const connectionState = useSignal(ConnectionState.Disconnected);
  const messages = useSignal<Message[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});

  useEffect(() => {
    fetch("/api/message").then((r) => r.json()).then((d_messages) => {
      d_messages.reverse();
      d_messages.forEach((message: Message) => {
        messages.value = [...messages.value, message];
      });
    });

    fetch("/api/room").then((r) => r.json()).then((d_room) => {
      setPositions(d_room);
    });

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
    });
    return () => events.close();
  }, []);

  function handleMove() {
    fetch("/api/move", {
      method: "POST",
      body: JSON.stringify({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
      }),
    });
  }

  return (
    <div class="w-full">
      <Canvas
        positions={positions}
        messages={messages.value}
        onClick={(e) => {
          const rect = (e.currentTarget as SVGSVGElement)
            .getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          fetch("/api/move", {
            method: "POST",
            body: JSON.stringify({
              x,
              y,
            }),
          });
        }}
      />
      <SendMessageForm />
      <ConnectionStateDisplay state={connectionState} />
    </div>
  );
}

function interpolate(
  t: number,
  x1: number,
  x2: number,
) {
  return x1 + (x2 - x1) * t;
}

interface CharaProps {
  x: number;
  y: number;
  username: string;
  uid: string;
  messages: Message[];
}

function Chara({ x, y, username, messages, uid }: CharaProps) {
  const svgRef = useRef<SVGGElement>(null);
  const [isWalk, setIsWalk] = useState(false);
  const [direction, setDirection] = useState(0);
  const [frame, setFrame] = useState(0);

  const [x1, setX1] = useState(x);
  const [y1, setY1] = useState(y);
  const [x2, setX2] = useState(x);
  const [y2, setY2] = useState(y);

  const [t, setT] = useState(1);
  const [duration, setDuration] = useState(0);
  const speed = 500;

  useEffect(() => {
    setX1(x);
    setY1(y);
    setX2(x);
    setY2(y);
    setT(0);
  }, []);

  useEffect(() => {
    const old = {
      x: interpolate(t, x1, x2),
      y: interpolate(t, y1, y2),
    };
    setX1(old.x);
    setY1(old.y);
    setX2(x);
    setY2(y);
    setT(0);

    const dist = Math.sqrt((x - old.x) ** 2 + (y - old.y) ** 2);
    setDuration(dist / speed);
    setIsWalk(true);

    setDirection((direction) => {
      if (old.x < x && old.y < y) {
        return 0;
      } else if (old.x > x && old.y < y) {
        return 2;
      } else if (old.x < x && old.y > y) {
        return 1;
      } else if (old.x > x && old.y > y) {
        return 3;
      }
      return direction;
    });
  }, [x, y, x1, y1, x2, y2]);

  const animationInterval = useRef(0);
  const [walkTimer, setWalkTimer] = useState(0);

  const animate = (ts: number) => {
    const x = interpolate(t, x1, x2);
    const y = interpolate(t, y1, y2);

    if (svgRef && svgRef.current) {
      svgRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
    const delta = 1 / duration / 100;
    if (t < 1 - delta) {
      setT((t) => t + delta);
    } else {
      setX1(x2);
      setY1(y2);
      setT(0);
      setIsWalk(false);
    }

    if (ts - walkTimer > 100 && isWalk) {
      setFrame((frame) => (frame + 1) % 4);
      setWalkTimer(ts);
    }

    animationInterval.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    animationInterval.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationInterval.current);
  }, [animate]);

  return (
    <g>
      <g ref={svgRef}>
        <text
          x={0}
          y={20}
          fill="white"
          stroke="#88F"
          stroke-width="4"
          font-size="13"
          font-weight="bold"
          font-family="sans-serif"
          text-anchor="middle"
          stroke-linejoin="round"
        >
          {username}
        </text>
        <text
          x={0}
          y={20}
          fill="white"
          font-size="13"
          font-weight="bold"
          font-family="sans-serif"
          text-anchor="middle"
        >
          {username}
        </text>
        <WalkDeno
          x={-50}
          y={-100}
          index={frame}
          direction={direction}
          color="#FFE"
          isWalk={false}
        />
        <foreignObject x={-100} y={-160} width={200} height={60}>
          {messages.filter((message) => message.uid === uid).slice().reverse()
            .slice(0, 1).map((
              message,
            ) => (
              <div class="flex justify-center items-center h-full bg-green-100 rounded-2xl p-4 text-center border-4 border-green-500">
                {message.body}
              </div>
            ))}
        </foreignObject>
      </g>
    </g>
  );
}

function Canvas(
  { positions, onClick, messages }: {
    positions: Record<string, Position>;
    messages: Message[];
    onClick: (e: MouseEvent) => void;
  },
) {
  return (
    <svg class="bg-white" width={1200} height={600} onClick={onClick}>
      <image href="/crop.png" width={1200} height={600} />

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
        />
      ))}

      <g transform="translate(0, 370)">
        <rect
          x={0}
          y={0}
          width={300}
          height={300}
          fill="rgba(0, 0, 0, 0.5)"
        />
        {Object.entries(messages).slice().reverse().slice(0, 10).reverse().map((
          [index, message],
          idx,
        ) => (
          <text x={10} y={20 * (idx + 1) + 10} fill="white" font-size="13">
            <tspan fill="#AAF">{message.username}</tspan> {message.body}
          </text>
        ))}
      </g>
    </svg>
  );
}

interface CSDisplayProps {
  state: Signal<ConnectionState>;
}

function ConnectionStateDisplay({ state }: CSDisplayProps) {
  switch (state.value) {
    case ConnectionState.Connecting:
      return <span>🟡 Connecting...</span>;
    case ConnectionState.Connected:
      return <span>🟢 Connected</span>;
    case ConnectionState.Disconnected:
      return <span>🔴 Disconnected</span>;
  }
}

function SendMessageForm() {
  const message = useSignal("");

  const onSubmit = (e: Event) => {
    e.preventDefault();
    if (message.value.length === 0) return;
    fetch("/api/send", {
      method: "POST",
      body: JSON.stringify({
        body: message.value,
      }),
    }).then(() => message.value = "");
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
