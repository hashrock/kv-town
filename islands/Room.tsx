import { useEffect, useState } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { Message } from "../types.ts";

interface Avatar {
  x: number;
  y: number;
  name: string;
}

enum ConnectionState {
  Connecting,
  Connected,
  Disconnected,
}

export default function Chat() {
  const connectionState = useSignal(ConnectionState.Disconnected);
  const messages = useSignal<Message[]>([]);

  useEffect(() => {
    fetch("/api/message").then((r) => r.json()).then((d_messages) => {
      d_messages.reverse();
      d_messages.forEach((message: Message) => {
        messages.value = [...messages.value, message];
      });
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
      const message = JSON.parse(e.data);
      messages.value = [...messages.value, message];
    });
    return () => events.close();
  }, []);

  return (
    <div class="w-full">
      <ConnectionStateDisplay state={connectionState} />
      <SendMessageForm />
      <Messages messages={messages} />
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
      {messages.value.map((msg) => (
        <li class="flex gap-2 items-center">
          <span class="font-bold">{msg.username}</span>
          <span>{msg.body}</span>
        </li>
      ))}
    </ul>
  );
}
