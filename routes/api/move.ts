import { Handlers } from "$fresh/server.ts";
import { getUserBySession } from "../../utils/auth_db.ts";
import { State, User } from "../../utils/types.ts";
import { updatePosition } from "../../utils/db.ts";
interface Data {
  user: User | null;
}
export const handler: Handlers<Data, State> = {
  async POST(req, ctx): Promise<Response> {
    const user = await getUserBySession(ctx.state.session ?? "");
    const msg = await req.json();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const x = msg["x"];
    const y = msg["y"];
    const color = msg["color"];

    if (typeof x !== "number") {
      return new Response("invalid body", { status: 400 });
    }
    if (typeof y !== "number") {
      return new Response("invalid body", { status: 400 });
    }

    const ts = Date.now();

    updatePosition({
      uid: user?.id ?? "anonymous",
      x: x,
      y: y,
      ts,
      username: user?.name ?? "anonymous",
      color,
    });

    return new Response("message sent");
  },
};
