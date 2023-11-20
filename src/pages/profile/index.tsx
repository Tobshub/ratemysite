import { api } from "@/utils/api";
import { ClientToken } from "@/utils/client_token";
import { CircularProgress, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";

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
    <>
      <Head>
        <title>Profile | RateMySite</title>
      </Head>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {profile.isLoading ? (
          <CircularProgress />
        ) : profile.isError ? (
          <Typography color="red">{profile.error?.message}</Typography>
        ) : null}
      </div>
    </>
  );
}
