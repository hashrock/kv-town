import { Handlers } from "$fresh/server.ts";
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
    const body = await req.json();
    const { x, y, name } = body;
    const id = await addRoomObject(user.id, x, y, name);
    return new Response(JSON.stringify({ id }));
  },
};
