import { User } from "🛠️/types.ts";
import { UserNameHorizontal } from "./User.tsx";

const linkClass = "text-sm text-blue-500 hover:underline";

export function Header(props: { user: User | null }) {
  return (
    <>
      <div class="flex justify-between items-center text-gray-200">
        <a href="/">
          <h1 class="text-2xl font-bold">KV Town</h1>
        </a>
        <a
          href="https://github.com/hashrock/kv-town"
          class={`${linkClass} text-right`}
        >
          View on GitHub
        </a>
      </div>

      <div class="flex items-center justify-between">
        {props.user
          ? (
            <>
              <p class="text-sm text-gray-600">
                Logged in as <UserNameHorizontal user={props.user} />
              </p>
              <a class={linkClass} href="/auth/signout">
                Log out
              </a>
            </>
          )
          : (
            <>
              <p class="text-sm text-gray-600">
                Anonymous user
              </p>
              <a class={linkClass} href="/auth/signin">
                Log in
              </a>
            </>
          )}
      </div>
    </>
  );
}
