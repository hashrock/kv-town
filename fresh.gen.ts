// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/_middleware.tsx";
import * as $1 from "./routes/api/listen.ts";
import * as $2 from "./routes/api/message.ts";
import * as $3 from "./routes/api/move.ts";
import * as $4 from "./routes/api/room.ts";
import * as $5 from "./routes/api/room_object.ts";
import * as $6 from "./routes/api/send.ts";
import * as $7 from "./routes/auth/oauth2callback.ts";
import * as $8 from "./routes/auth/signin.ts";
import * as $9 from "./routes/auth/signout.ts";
import * as $10 from "./routes/index.tsx";
import * as $$0 from "./islands/Room.tsx";

const manifest = {
  routes: {
    "./routes/_middleware.tsx": $0,
    "./routes/api/listen.ts": $1,
    "./routes/api/message.ts": $2,
    "./routes/api/move.ts": $3,
    "./routes/api/room.ts": $4,
    "./routes/api/room_object.ts": $5,
    "./routes/api/send.ts": $6,
    "./routes/auth/oauth2callback.ts": $7,
    "./routes/auth/signin.ts": $8,
    "./routes/auth/signout.ts": $9,
    "./routes/index.tsx": $10,
  },
  islands: {
    "./islands/Room.tsx": $$0,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
