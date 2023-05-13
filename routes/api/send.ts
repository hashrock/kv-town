import { BroadcastMessage } from "../../types.ts";
import { Handlers } from "$fresh/server.ts";
import { addMessage } from "../../utils/db.ts";
import { State, User } from "../../utils/types.ts";
import { getUserBySession } from "../../utils/auth_db.ts";
interface Data {
  user: User | null;
}
export const handler: Handlers<Data, State> = {
  async POST(req, ctx): Promise<Response> {
    const user = await getUserBySession(ctx.state.session ?? "");
    const msg = await req.json();

    const body = msg["body"];
    if (typeof body !== "string") {
      return new Response("invalid body", { status: 400 });
    }

    const channel = new BroadcastChannel("chat");
    const payload = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      uid: user?.id ?? "anonymous",
      username: user?.name ?? "anonymous",
      body: body,
    };

    const message: BroadcastMessage = {
      ts: Date.now(),
      uid: user?.id ?? "anonymous",
      username: user?.name ?? "anonymous",
      type: "message",
      payload,
    };

    channel.postMessage(message);
    channel.close();

    addMessage(payload.uid, payload.username, payload.body);

    return new Response("message sent");
  },
};
