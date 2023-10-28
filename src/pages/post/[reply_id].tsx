import styles from "@/styles/post-page.module.css";
import { LoadingButton } from "@/components/button";
import { NavBar } from "@/components/navbar";
import Post, { PostAuthor } from "@/components/post";
import { RouterOutputs, api } from "@/utils/api";
import { CircularProgress, TextField, Typography } from "@mui/material";
import { TRPCClientError } from "@trpc/client";
import { type NextRouter, useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import { UserStore } from "@/utils/global-store";

type TReply = RouterOutputs["post"]["getReplies"][0];

export default function PostPage() {
  const router = useRouter();
  const reply_id = router.query.reply_id as string;

  const [optimisticReplies, setOptimisticReplies] = useState<TReply[]>([]);

  const post = api.post.get.useQuery(reply_id);

  if (post.isInitialLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }
  if (!post.data) {
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
        <Post {...post.data} large />
        <ReplyBox
          post_id={reply_id}
          optimisticUpdate={(reply) => setOptimisticReplies((state) => [reply, ...state])}
        />
        {reply_id && post.data.author ? (
          <Replies post_id={reply_id} optimisticReplies={optimisticReplies} />
        ) : null}
      </main>
    </div>
  );
}

function Replies(props: { post_id: string; optimisticReplies: TReply[] }) {
  const replies = api.post.getReplies.useQuery({ post_id: props.post_id });
  const router = useRouter();
  return (
    <div className={styles.replies_container}>
      {props.optimisticReplies.length
        ? props.optimisticReplies.map((reply) => (
            <Reply key={reply.reply_id} {...reply} router={router} />
          ))
        : null}
      {replies.data && replies.data.length
        ? replies.data.map((reply) => <Reply key={reply.reply_id} {...reply} router={router} />)
        : null}
    </div>
  );
}

function Reply(props: TReply & { router: NextRouter }) {
  return (
    <div className={styles.reply}>
      <PostAuthor {...props.author} fontSize={20} />
      <p style={{ whiteSpace: "pre-line" }}>{props.content}</p>
    </div>
  );
}

function ReplyBox(props: { post_id: string; optimisticUpdate: (reply: TReply) => void }) {
  const userData = UserStore.get("user");
  const [errorMsg, setErrorMsg] = useState("");
  const replyMut = api.post.reply.useMutation({
    onSuccess: (data) => {
      props.optimisticUpdate({ ...data, author: userData });
    },
    onError: (e) => {
      if (e instanceof TRPCClientError) {
        try {
          const err: { message: string } = JSON.parse(e.message)[0];
          setErrorMsg(err.message);
        } catch {
          if (e.message) {
            setErrorMsg(e.message);
          } else {
            setErrorMsg("Something went wrong!");
          }
        }
        return;
      }
      setErrorMsg(e.message);
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content")?.toString();
    if (!content) return;

    replyMut.mutate({
      content,
      post_id: props.post_id,
    });

    e.currentTarget.reset();
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "98%",
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {errorMsg ? (
          <Typography color="red" fontSize={12}>
            {errorMsg}
          </Typography>
        ) : null}
        <TextField
          required
          name="content"
          multiline
          minRows={4}
          maxRows={8}
          placeholder="Thoughts?"
          fullWidth
        />
        <LoadingButton
          type="submit"
          isLoading={replyMut.isLoading}
          isSuccess={replyMut.isSuccess}
          isError={replyMut.isError}
        >
          Reply
        </LoadingButton>
      </form>
    </div>
  );
}
