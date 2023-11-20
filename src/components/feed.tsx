import { api } from "@/utils/api";
import Post from "./post";
import { CircularProgress } from "@mui/material";

export default function Feed() {
  const { data, isInitialLoading } = api.post.feed.useQuery({});

  return (
    <main>
      {data?.length ? (
        data.map((post) => <Post key={post.reply_id} {...post} />)
      ) : isInitialLoading ? (
        <div style={{ display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <p>No posts yet. Be the first to post!</p>
      )}
    </main>
  );
}
