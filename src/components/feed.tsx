import { api } from "@/utils/api";
import Post from "./post";

export default function Feed() {
  const { data, error, isInitialLoading } = api.post.feed.useQuery({});

  return (
    <main>
      {data && data.length ? data.map((post) => <Post key={post.reply_id} {...post} />) : null}
    </main>
  );
}
