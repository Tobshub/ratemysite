import { api } from "@/utils/api";
import styles from "@/styles/feed.module.css";

export default function Feed() {
  const { data, error, isInitialLoading } = api.post.feed.useQuery({});

  return (
    <main>
      {data && data.length
        ? data.map((post) => <Post key={post.reply_id} {...post} />)
        : null}
    </main>
  );
}

function Post(props: {
  title: string;
  content: string;
  pictures: string[] | undefined;
  reply_id: string;
  created_at: Date;
  author: {
    name: string;
    display_picture: string | undefined;
  };
}) {
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
      <img src={props.display_picture} />
      <span>{props.name}</span>
    </div>
  );
}
