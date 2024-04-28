import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { State } from "🛠️/types.ts";

export async function handler(
  req: Request,
  ctx: FreshContext<State>,
) {
  const url = new URL(req.url);
  if (url.pathname === "") return await ctx.next();
  const cookies = getCookies(req.headers);
  ctx.state.session = cookies.session;
  const resp = await ctx.next();
  return resp;
}
