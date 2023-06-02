import { Handlers } from "$fresh/server.ts";
import { BroadcastMessage } from "../../types.ts";
import { getUserBySession } from "../../utils/auth_db.ts";
import { addRoomObject, listRoomObject } from "../../utils/db.ts";
import { State, User } from "../../utils/types.ts";
interface Data {
  user: User | null;
}

export const handler: Handlers<Data, State> = {
  async GET(req, ctx): Promise<Response> {
    const list = await listRoomObject();
    return new Response(JSON.stringify(list));
  },
  async POST(req, ctx): Promise<Response> {
    const user = await getUserBySession(ctx.state.session ?? "");
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const channel = new BroadcastChannel("chat");
    const ts = Date.now();
    const body = await req.json();
    const { x, y, name, size } = body;

    const message: BroadcastMessage = {
      ts,
      uid: user?.id ?? "anonymous",
      username: user?.name ?? "anonymous",
      payload: {
        x: x,
        y: y,
        name: name,
        size: size,
      },
      type: "room_object",
    };
    channel.postMessage(message);
    channel.close();

    const id = await addRoomObject(user.id, x, y, name, size);
    return new Response(JSON.stringify({ id }));
  },
};
