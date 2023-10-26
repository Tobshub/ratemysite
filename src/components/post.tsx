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

export default function Post(props: RouterOutputs["post"]["feed"][0] & { large?: boolean }) {
  const router = useRouter();

  return (
    <div
      className={props.large ? styles.post_large : styles.post}
      onClick={() => router.push(`/post/${props.reply_id}`)}
      style={props.large ? {} : { cursor: "pointer" }}
    >
      <PostAuthor {...props.author} fontSize={props.large ? 28 : undefined} />
      {props.flags && props.flags.length ? <PostFlags flags={props.flags} /> : null}
      <h2>{props.title}</h2>
      <p style={{ whiteSpace: "pre-line" }}>{props.content}</p>
      {props.pictures && props.pictures.length ? (
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

  return (
    <>
      <img className={styles.post_pic} src={props.src} onClick={() => setIsOpen(true)} />
      {isOpen ? (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
          <img className={styles.open_post_pic} src={props.src} />
        </Dialog>
      ) : null}
    </>
  );
}

// TODO: probably gonna add some sort of post search with flags
function PostFlags(props: { flags: PostFlags[] }) {
  return (
    <div
      style={{ display: "flex", gap: ".2rem", flexWrap: "wrap" }}
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
}) {
  return (
    <div onClick={(e) => /* prevent opening post */ e.stopPropagation()}>
      <Link
        href={`/profile/${props.name}`}
        style={{
          color: "inherit",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: ".5rem",
        }}
      >
        {props.display_picture ? (
          <img src={props.display_picture} className={styles.display_picture} />
        ) : (
          <Avatar
            size={props.fontSize ?? 24}
            name={props.name}
            variant="beam"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
        )}
        <Typography sx={{ "&:hover": { fontWeight: "500" }, fontSize: props.fontSize }}>
          {props.name}
        </Typography>
      </Link>
    </div>
  );
}
