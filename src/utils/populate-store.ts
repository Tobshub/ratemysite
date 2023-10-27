import { api } from "./api";
import { ClientToken } from "./client_token";
import { UserStore } from "./global-store";

export function PopulateUserStore() {
  console.log("attempting to populate user store");
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
  if (res.data) {
    console.log("populate user store success");
    UserStore.set("user", res.data);
  }
}
