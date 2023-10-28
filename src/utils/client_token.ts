"use client";
const TOKEN = "___rate_my_site_user_token";

let localStorage: Storage | undefined;

if (typeof window !== "undefined") {
  localStorage = window.localStorage;
}

export const ClientToken = {
  set: (value: string) => {
    if (!localStorage) return undefined;
    const token = JSON.stringify(value);
    localStorage.setItem(TOKEN, token);
    return token;
  },
  get: () => {
    if (!localStorage) return undefined;
    let token = localStorage.getItem(TOKEN);
    if (token) {
      token = JSON.parse(token) as string;
      return token;
    }
    return undefined;
  },
  remove: () => {
    if (!localStorage) return undefined;
    let token = localStorage.getItem(TOKEN);
    if (token) {
      localStorage.removeItem(TOKEN);
      token = JSON.parse(token) as string;
      return token;
    } else {
      return undefined;
    }
  },
};
