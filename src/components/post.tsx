import type { RouterOutputs } from "@/utils/api";
import styles from "@/styles/post.module.css";
import Link from "next/link";
import Avatar from "boring-avatars";
import { useRouter } from "next/router";
import { Chip, Dialog, Typography } from "@mui/material";
import type { PostFlags } from "@/server/api/tdb";
import { useState } from "react";

export const PostFlagNames: Record<PostFlags, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  login_required: "Login required",
  beginner: "Beginner",
  urgent: "Urgent",
};

export default function Post(
  props: (RouterOutputs["post"]["get"] | RouterOutputs["post"]["getReply"]) & {
    size?: "small" | "normal" | "large";
    title: string;
    noLink?: boolean;
    isReply?: boolean;
  }
) {
  const router = useRouter();

  return (
    <div
      className={styles[props.size ?? "normal"]}
      onClick={
        props.noLink
          ? undefined
          : () => {
              router.push(
                props.isReply ? `/post/reply/${props.reply_id}` : `/post/${props.reply_id}`
              );
            }
      }
      style={props.size === "large" ? {} : { cursor: "pointer" }}
    >
      <PostAuthor {...props.author} className={styles.post_author} />
      {"flags" in props && props.flags?.length ? <PostFlagsComponent flags={props.flags} /> : null}
      <h2>{props.title}</h2>
      <p style={{ whiteSpace: "pre-line" }}>{props.content}</p>
      {"pictures" in props && props.pictures?.length ? (
        <div className={styles.post_pic_container} onClick={(e) => e.stopPropagation()}>
          {props.pictures.map((pic, idx) => (
            <PostImage src={pic} key={idx} />
          ))}
        </div>
      ) : null}
      <PostActions {...props} />
    </div>
  );
}

// TODO: `reply`, `share` buttons go here
function PostActions(props: { reply_id: string; large?: boolean }) {
  return <div className={styles.post_actions}></div>;
}

// TODO: implement next/back when there's more than one image
function PostImage(props: { src: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const src = props.src.startsWith("data")
    ? props.src
    : `/api/img/${encodeURIComponent(props.src)}`;

  return (
    <>
      <img className={styles.post_pic} loading="lazy" src={src} onClick={() => setIsOpen(true)} />
      {isOpen ? (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
          <img className={styles.open_post_pic} alt="" src={src} />
        </Dialog>
      ) : null}
    </>
  );
}

// TODO: probably gonna add some sort of post search with flags
function PostFlagsComponent(props: { flags: PostFlags[] }) {
  return (
    <div
      style={{ display: "flex", gap: ".2rem", flexWrap: "wrap", cursor: "pointer" }}
      onClick={(e) => /* prevent opening post */ e.stopPropagation()}
    >
      {props.flags.map((flag, idx) => (
        <Chip key={idx} label={PostFlagNames[flag]} />
      ))}
    </div>
  );
}

export function PostAuthor(props: {
  name: string;
  display_picture: string | undefined;
  fontSize?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: "fit-content" }}
      onClick={(e) => /* prevent opening post */ e.stopPropagation()}
      className={props.className}
    >
      <Link
        href={`/profile/${props.name}`}
        style={{
          color: "inherit",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: ".5rem",
          width: "fit-content",
        }}
      >
        {props.display_picture ? (
          <img src={props.display_picture} alt="" className={styles.display_picture} />
        ) : (
          <Avatar
            name={props.name}
            variant="beam"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
        )}
        <Typography sx={{ "&:hover": { fontWeight: "500" } }}>{props.name}</Typography>
      </Link>
    </div>
  );
}
