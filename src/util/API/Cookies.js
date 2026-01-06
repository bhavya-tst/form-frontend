export const setCookie = (name, value, days) => {
  let expires = "";
  const date = new Date();
  if (days) {
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  localStorage.setItem("cookie-expires", date.toUTCString());
  document.cookie = `${name} =  ${value || ""}  ${expires} ; path=/`;
};

export const getCookie = () => localStorage.getItem("token") || null;

export const eraseCookie = (name) => {
  document.cookie = `${name} =; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};
