import { Handlers } from "$fresh/server.ts";
import { listMessage } from "../../utils/db.ts";

export const handler: Handlers = {
  async GET(_req: Request): Promise<Response> {
    return new Response(JSON.stringify(await listMessage()));
  },
};
