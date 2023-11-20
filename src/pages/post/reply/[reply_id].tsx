import { NavBar } from "@/components/navbar";
import Post from "@/components/post";
import { Replies, ReplyBox } from "../[reply_id]";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type TReply } from "@/components/reply";
import { api } from "@/utils/api";
import CircularProgress from "@mui/material/CircularProgress";

export default function ReplyPage() {
  const router = useRouter();
  const reply_id = router.query.reply_id as string;

  const [optimisticReplies, setOptimisticReplies] = useState<TReply[]>([]);

  const reply = api.post.getReply.useQuery(reply_id, { enabled: !!reply_id, cacheTime: 0 });
  const parent = api.post.getParent.useQuery(
    {
      post_id: reply.data?.post_id,
      parent_id: reply.data?.parent_id ?? undefined,
    },
    { enabled: !!reply.data, cacheTime: 0 }
  );

  useEffect(() => {
    if (reply_id && optimisticReplies.length) {
      setOptimisticReplies([]);
    }
  }, [reply_id]);

  if (reply.isInitialLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  // TODO: work on not found component
  if (!reply.data) {
    return (
      <div className="page">
        <NavBar />
        <main>Not Found...</main>
      </div>
    );
  }

  return (
    <div className="page">
      <NavBar />
      <main>
        {parent.data ? (
          <Post title="Reply" {...parent.data} isReply={!!reply.data?.parent_id} size="small" />
        ) : null}
        <Post {...reply.data} title="Reply" size="large" noLink />
        <ReplyBox
          post_id={reply.data.post_id}
          parent_id={reply_id}
          optimisticUpdate={(reply) => setOptimisticReplies((state) => [reply, ...state])}
        />
        {reply_id && reply.data.author ? (
          <Replies
            post_id={reply.data.post_id}
            parent_id={reply_id}
            optimisticReplies={optimisticReplies}
          />
        ) : null}
      </main>
    </div>
  );
}
