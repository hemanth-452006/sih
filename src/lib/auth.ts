import { getCurrentSession, setSessionCookie, clearSessionCookie } from "./session";

export { getCurrentSession as auth };
export const signIn = setSessionCookie;
export const signOut = clearSessionCookie;
