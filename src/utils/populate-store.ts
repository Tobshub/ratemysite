"use client";

import { useRouter } from "next/router";
import { api } from "./api";
import { ClientToken } from "./client_token";
import { UserStore } from "./global-store";

export function PopulateUserStore() {
  console.log("attempting to populate user store");
  const router = useRouter();
  const res = api.profile.getWithPostId.useQuery();
  if (!ClientToken.get()) {
    console.log("populate user store error: no token");
    return;
  }
  const check = UserStore.get("user");
  if (check.name) {
    console.log("populate user store skip: store not empty");
    return;
  }
  if (res.error?.message === "User profile not found") {
    console.log("populate user store error: profile not found");
    ClientToken.remove();
    router.reload();
    return;
  }
  if (res.data) {
    console.log("populate user store success");
    UserStore.set("user", res.data);
  }
}
