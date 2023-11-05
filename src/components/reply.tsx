import styles from "@/styles/post-page.module.css";
import { api, type RouterOutputs } from "@/utils/api";
import type { NextRouter } from "next/router";
import { PostAuthor } from "./post";
import { IconButton } from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import ReplyIcon from "@mui/icons-material/Reply";
import { useEffect, useState } from "react";

type TReply = RouterOutputs["post"]["getReplies"][0];

// TODO: route to reply page on click
// TODO: reply to reply dialog
export function Reply(props: TReply & { router: NextRouter }) {
  const { userVote, toggleUpVote, toggleDownVote } = useVote({
    reply_id: props.reply_id,
    user_vote: props.user_vote,
  });

  return (
    <div className={styles.reply}>
      <PostAuthor {...props.author} fontSize={20} />
      <p style={{ whiteSpace: "pre-line" }}>{props.content}</p>
      <div className={styles.reply_actions}>
        <IconButton title="upvote" onClick={toggleUpVote}>
          <HandshakeIcon color={userVote > 0 ? "success" : undefined} fontSize="small" />
        </IconButton>
        <IconButton title="downvote" onClick={toggleDownVote}>
          <SportsMmaIcon color={userVote < 0 ? "error" : undefined} fontSize="small" />
        </IconButton>
        <IconButton title="reply">
          <ReplyIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}

function useVote(props: { reply_id: string; user_vote: number }) {
  const [userVote, setUserVote] = useState(props.user_vote);
  const toggleUpVote = () => {
    if (userVote > 0) {
      setUserVote(0);
      return;
    }
    setUserVote(1);
  };

  const toggleDownVote = () => {
    if (userVote < 0) {
      setUserVote(0);
      return;
    }
    setUserVote(-1);
  };

  const voteMut = api.post.voteOnReply.useMutation();

  useEffect(() => {
    voteMut.mutate({
      reply_id: props.reply_id,
      userVote: userVote,
    });
  }, [userVote]);

  return {
    userVote,
    toggleUpVote,
    toggleDownVote,
  };
}
