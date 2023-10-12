import type { RouterOutputs } from "@/utils/api";
import styles from "@/styles/post.module.css";
import Link from "next/link";
import Avatar from "boring-avatars";

export default function Post(props: RouterOutputs["post"]["feed"][0]) {
  return (
    <div className={styles.post}>
      <PostAuthor {...props.author} />
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

function PostAuthor(props: {
  name: string;
  display_picture: string | undefined;
}) {
  return (
    <div>
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
            size={24}
            name={props.name}
            variant="beam"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
        )}
        <span>{props.name}</span>
      </Link>
    </div>
  );
}
