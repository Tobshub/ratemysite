import { NavBar } from "@/components/navbar";
import Post from "@/components/post";
import { type RouterOutputs, api } from "@/utils/api";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

export default function PostPage() {
  const router = useRouter();
  const reply_id = router.query.reply_id as string;

  const post = api.post.get.useQuery(reply_id);

  if (post.isInitialLoading) {
    return <CircularProgress />;
  }
  if (!post.data) {
    return <>Not Found...</>;
  }
  return (
    <div className="page">
      <NavBar />
      <main>
        <Post {...post.data} large />
      </main>
    </div>
  );
}
