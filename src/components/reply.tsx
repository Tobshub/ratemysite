import styles from "@/styles/post-page.module.css";
import { api, type RouterOutputs } from "@/utils/api";
import type { NextRouter } from "next/router";
import { PostAuthor } from "./post";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import ReplyIcon from "@mui/icons-material/Reply";
import { useEffect, useState } from "react";
import { ReplyBox } from "@/pages/post/[reply_id]";

export type TReply = RouterOutputs["post"]["getReplies"][0];

// TODO: route to reply page on click
export function Reply(props: TReply & { router: NextRouter }) {
  const { userVote, toggleUpVote, toggleDownVote } = useVote({
    reply_id: props.reply_id,
    user_vote: props.user_vote,
  });

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

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
        <IconButton title="reply" onClick={() => setReplyDialogOpen(true)}>
          <ReplyIcon fontSize="small" />
        </IconButton>
      </div>
      {replyDialogOpen ? (
        <ReplyDialog open={replyDialogOpen} close={() => setReplyDialogOpen(false)} data={props} />
      ) : null}
    </div>
  );
}

function ReplyDialog(props: {
  open: boolean;
  close: () => void;
  data: {
    author: { name: string; display_picture: string | undefined };
    content: string;
    reply_id: string;
    post_id: string;
  };
}) {
  return (
    <Dialog open={props.open} onClose={props.close} fullWidth>
      <DialogTitle>Reply</DialogTitle>
      <DialogContent>
        <PostAuthor {...props.data.author} fontSize={20} />
        <p style={{ whiteSpace: "pre-line" }}>{props.data.content}</p>
      </DialogContent>
      <ReplyBox
        post_id={props.data.post_id}
        parent_id={props.data.reply_id}
        optimisticUpdate={() => props.close()}
      />
    </Dialog>
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
    if (props.reply_id) {
      voteMut.mutate({
        reply_id: props.reply_id,
        userVote: userVote,
      });
    }
  }, [userVote]);

  return {
    userVote,
    toggleUpVote,
    toggleDownVote,
  };
}
