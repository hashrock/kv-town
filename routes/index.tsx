import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { State, User } from "🛠️/types.ts";
import { getUserBySession, listRecentlySignedInUsers } from "🛠️/auth_db.ts";

import { Button, ButtonLink } from "🧱/Button.tsx";
import { Header } from "🧱/Header.tsx";
import { JSX } from "preact";
import Room from "../islands/Room.tsx";

type Data = SignedInData | null;

interface SignedInData {
  user: User;
  users: User[];
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) return ctx.render(null);

  const [user, users] = await Promise.all([
    getUserBySession(ctx.state.session),
    listRecentlySignedInUsers(),
  ]);
  if (!user) return ctx.render(null);

  return ctx.render({ user, users });
}

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>KV NotePad</title>
      </Head>
      <body class="bg-gray-100">
        <div class="px-4 py-8 mx-auto max-w-screen-md">
          <Header user={props.data?.user ?? null} />
          {props.data ? <SignedIn {...props.data} /> : <SignedOut />}
        </div>
      </body>
    </>
  );
}

function LinkButton(
  props: JSX.HTMLAttributes<HTMLAnchorElement>,
) {
  return (
    <a
      {...props}
      class={`inline-block cursor-pointer px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 ${
        props.class ?? ""
      }`}
    />
  );
}

function SignedIn(props: SignedInData) {
  return (
    <>
      <div class="">
        <div class="mt-16 flex justify-end">
          <LinkButton href="/new">
            Create New
          </LinkButton>
        </div>

        <div>
          <Room />
        </div>
      </div>
    </>
  );
}

function SignedOut() {
  return (
    <>
      <p class="my-6">
        <ButtonLink href="/auth/signin">
          Log in with GitHub
        </ButtonLink>
      </p>
    </>
  );
}
