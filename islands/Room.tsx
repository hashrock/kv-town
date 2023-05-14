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
      <ConnectionStateDisplay state={connectionState} />
      <SendMessageForm />

      <div>
        <button type="button" onClick={handleMove}>
          Move
        </button>
      </div>

      <Positions positions={positions} />
      <Canvas
        positions={positions}
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

      <Messages messages={messages} />
    </div>
  );
}

function Chara({ x, y }: { x: number; y: number }) {
  const svgRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const animation = svgRef.current.animate([
        { transform: `translate(${x}px, ${y}px)` },
      ], {
        duration: 1000,
        fill: "forwards",
        easing: "ease-in-out",
      });
      animation.finished.then(() => {
        animation.commitStyles();
      });
    }
  }, [x, y]);

  return (
    <g ref={svgRef}>
      <WalkDeno
        x={-50}
        y={-100}
        index={0}
        direction={0}
        color="#FFE"
        isWalk={false}
      />
    </g>
  );
}

function Canvas(
  { positions, onClick }: {
    positions: Record<string, Position>;
    onClick: (e: MouseEvent) => void;
  },
) {
  return (
    <svg class="bg-white" width={1200} height={600} onClick={onClick}>
      {Object.entries(positions).map(([uid, position]) => (
        <Chara x={position.x} y={position.y} />
      ))}
    </svg>
  );
}

function Positions({ positions }: { positions: Record<string, Position> }) {
  return (
    <div>
      {Object.entries(positions).map(([uid, position]) => (
        <div>
          <span>{position.username}({uid})</span>:
          <span>[{position.x}</span>,
          <span>{position.y}]</span>...
          <span>
            {Math.round((Date.now() - position.ts) / 1000)}second ago
          </span>
        </div>
      ))}
    </div>
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
    <form class="flex gap-2 py-4" onSubmit={onSubmit}>
      <input
        class="border border-gray-300 rounded px-2 py-1"
        type="text"
        value={message.value}
        onInput={(e) => message.value = e.currentTarget.value}
      />

      <button>Submit</button>
    </form>
  );
}

function Messages({ messages }: { messages: Signal<Message[]> }) {
  return (
    <ul>
      {messages.value.slice().reverse().map((msg) => (
        <li class="flex gap-2 items-center">
          <span class="font-bold">{msg.username}</span>
          <span>{msg.body}</span>
        </li>
      ))}
    </ul>
  );
}
