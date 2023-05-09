import { BroadcastMessage, Message, MoveMesssage } from "../../types.ts";
import { Handlers } from "$fresh/server.ts";
import { addMessage, getUserBySession } from "../../utils/db.ts";
import { State, User } from "../../utils/types.ts";
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

    const message: BroadcastMessage = {
      ts: Date.now(),
      uid: user?.id ?? "anonymous",
      username: user?.name ?? "anonymous",
      payload: {
        x: x,
        y: y,
      },
      type: "move",
    };

    channel.postMessage(message);
    channel.close();

    return new Response("message sent");
  },
};
