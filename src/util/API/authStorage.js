import { setCookie, eraseCookie } from "./Cookies";

export const getAuthToken = () => {
  return localStorage.getItem("token") || null;
};

export const setAuthDetails = (accessToken) => {
  setCookie("SAID", accessToken, 1);
  localStorage.setItem("token", accessToken);
};

export const deleteAuthDetails = () => {
  eraseCookie("SAID");
  localStorage.removeItem("token");
};
