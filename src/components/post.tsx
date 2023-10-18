import type { RouterOutputs } from "@/utils/api";
import styles from "@/styles/post.module.css";
import Link from "next/link";
import Avatar from "boring-avatars";
import { useRouter } from "next/router";
import { Chip, Typography } from "@mui/material";
import type { PostFlags } from "@/server/api/tdb";
import { PostFlagNames } from "./post-flags";

export default function Post(
  props: RouterOutputs["post"]["feed"][0] & { large?: boolean }
) {
  const router = useRouter();

  return (
    <div
      className={props.large ? styles.post_large : styles.post}
      onClick={() => router.push(`/post/${props.reply_id}`)}
      style={{ cursor: "pointer" }}
    >
      <PostAuthor {...props.author} fontSize={props.large ? 28 : undefined} />
      {props.flags && props.flags.length ? (
        <PostFlags flags={props.flags} />
      ) : null}
      <h2>{props.title}</h2>
      <p>{props.content}</p>
      {props.pictures && props.pictures.length ? (
        <div className={styles.post_pic_container}>
          {props.pictures.map((pic, idx) => (
            <img className={styles.post_pic} src={pic} key={idx} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

// TODO: probably gonna add some sort of post search with flags
function PostFlags(props: { flags: PostFlags[] }) {
  return (
    <div
      style={{ display: "flex", gap: ".2rem" }}
      onClick={(e) => /* prevent opening post */ e.stopPropagation()}
    >
      {props.flags.map((flag, idx) => (
        <Chip key={idx} label={PostFlagNames[flag]} />
      ))}
    </div>
  );
}

function PostAuthor(props: {
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
        <Typography
          sx={{ "&:hover": { fontWeight: "500" }, fontSize: props.fontSize }}
        >
          {props.name}
        </Typography>
      </Link>
    </div>
  );
}
