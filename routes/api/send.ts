import { Message } from "../../types.ts";
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

    const body = msg["body"];
    if (typeof body !== "string") {
      return new Response("invalid body", { status: 400 });
    }

    const channel = new BroadcastChannel("chat");

    const message: Message = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      uid: user?.id ?? "anonymous",
      username: user?.name ?? "anonymous",
      body,
    };

    channel.postMessage(message);
    channel.close();

    addMessage(message.uid, message.username, message.body);

    return new Response("message sent");
  },
};
