import { setCookie, getCookie, removeCookie } from "./session"
import { authenticateUser } from './api'
import redirect from "./redirect"

export const isAuthenticated = (ctx = {}) => !!getCid(ctx);

export const getCid = (ctx = {}) => {
  return getCookie("cid", ctx.req);
};

export const signOut = (ctx = {}) => {
  if (process.browser) {
    removeCookie("cid");
    redirect("/", ctx);
  }
};

export const signInUser = async (customerId) => {
  removeCookie("cid");

  const res = await authenticateUser(customerId)

  if (res.error) {
    return "Invalid customer ID."
  }
  
  setCookie("cid", customerId)
  redirect("/")
  return null
}

export const redirectUnauthenticated = (path, ctx = {}) => {
  if (!isAuthenticated(ctx)){
    redirect(path, ctx)
    return true
  }
  return false
}
