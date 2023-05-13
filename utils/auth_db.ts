import { OauthSession, User } from "./types.ts";
const kv = await Deno.openKv();

export async function getAndDeleteOauthSession(
  session: string,
): Promise<OauthSession | null> {
  const res = await kv.get<OauthSession>(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value;
}

export async function setOauthSession(session: string, value: OauthSession) {
  await kv.set(["oauth_sessions", session], value);
}

export async function setUserWithSession(user: User, session: string) {
  await kv
    .atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function getUserBySession(session: string) {
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
}

export async function getUserById(id: string) {
  const res = await kv.get<User>(["users", id]);
  return res.value;
}

export async function getUserByLogin(login: string) {
  const res = await kv.get<User>(["users_by_login", login]);
  return res.value;
}

export async function deleteSession(session: string) {
  await kv.delete(["users_by_session", session]);
}

export async function listRecentlySignedInUsers(): Promise<User[]> {
  const users = [];
  const iter = kv.list<User>(
    { prefix: ["users_by_last_signin"] },
    {
      limit: 10,
      reverse: true,
    },
  );
  for await (const { value } of iter) {
    users.push(value);
  }
  return users;
}
