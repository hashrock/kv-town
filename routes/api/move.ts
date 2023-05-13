import { BroadcastMessage, Message, MoveMesssage } from "../../types.ts";
import { Handlers } from "$fresh/server.ts";
import {
  getUserBySession,
} from "../../utils/auth_db.ts";
import { State, User } from "../../utils/types.ts";
import { updatePosition } from "../../utils/db.ts";
interface Data {
  user: User | null;
}
export const handler: Handlers<Data, State> = {
  async POST(req, ctx): Promise<Response> {
    const user = await getUserBySession(ctx.state.session ?? "");
    const msg = await req.json();

    const x = msg["x"];
    const y = msg["x"];
    if (typeof x !== "number") {
      return new Response("invalid body", { status: 400 });
    }
    if (typeof y !== "number") {
      return new Response("invalid body", { status: 400 });
    }

    const channel = new BroadcastChannel("chat");

    const ts = Date.now();

    const message: BroadcastMessage = {
      ts,
      uid: user?.id ?? "anonymous",
      username: user?.name ?? "anonymous",
      payload: {
        x: x,
        y: y,
      },
      type: "move",
    };

    updatePosition({
      uid: user?.id ?? "anonymous",
      x: x,
      y: y,
      ts,
      username: user?.name ?? "anonymous",
    });

    channel.postMessage(message);
    channel.close();

    return new Response("message sent");
  },
};
