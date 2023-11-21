import { NavbarLayout } from "@/layouts/navbar";
import { api } from "@/utils/api";
import { ClientToken } from "@/utils/client_token";
import { CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import type { ReactElement } from "react";

ProfileRedirect.getLayout = function (page: ReactElement) {
  return <NavbarLayout title="Profile | RateMySite">{page}</NavbarLayout>;
};

export default function ProfileRedirect() {
  const router = useRouter();

  if (!ClientToken.get()) {
    router.replace("/auth");
  }

  // TODO: use this result to populate some global store
  // to avoid refetching in actual profile page.
  const profile = api.profile.getWithPostId.useQuery();

  if (profile.data?.name) {
    router.replace(`/profile/${profile.data.name}`);
  }

  return (
    <main style={{ display: "flex", justifyContent: "center" }}>
      {profile.isLoading ? (
        <CircularProgress />
      ) : profile.isError ? (
        <Typography color="red">{profile.error?.message}</Typography>
      ) : null}
    </main>
  );
}
