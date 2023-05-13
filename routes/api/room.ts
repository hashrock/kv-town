import { BroadcastMessage, Message, MoveMesssage } from "../../types.ts";
import { Handlers } from "$fresh/server.ts";
import {
  addMessage,
  getPosition,
  getUserBySession,
  updatePosition,
} from "../../utils/db.ts";
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
