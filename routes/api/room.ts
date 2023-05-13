import { Handlers } from "$fresh/server.ts";
import { getPosition } from "../../utils/db.ts";
import { State, User } from "../../utils/types.ts";
interface Data {
  user: User | null;
}

export const handler: Handlers<Data, State> = {
  async GET(req, ctx): Promise<Response> {
    const list = await getPosition();
    return new Response(JSON.stringify(list));
  },
};
