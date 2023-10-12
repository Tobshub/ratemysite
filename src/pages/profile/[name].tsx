import styles from "@/styles/profile.module.css";
import { NavBar } from "@/components/navbar";
import { RouterOutputs, api } from "@/utils/api";
import Head from "next/head";
import { useRouter } from "next/router";
import Avatar from "boring-avatars";
import Post from "@/components/post";

export default function ProfilePage() {
  const router = useRouter();

  const profile = api.profile.get.useQuery(router.query.name as string);
  const title = profile.data?.name ?? "Profile";

  return (
    <>
      <Head>
        <title>{title.toString()} on RateMySite | RateMySite</title>
      </Head>
      <div className="page">
        <NavBar />
        {profile.data ? (
          <Profile {...profile.data} />
        ) : (
          "Profile does not exists"
        )}
      </div>
    </>
  );
}

function Profile(props: RouterOutputs["profile"]["get"]) {
  return (
    <main>
      <div className={styles.profile}>
        <div className={styles.highlighted_info}>
          {props.display_picture ? (
            <img
              src={props.display_picture}
              className={styles.display_picture}
            />
          ) : (
            <Avatar
              size={75}
              name={props.name}
              variant="beam"
              colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
            />
          )}
          <div className={styles.info_text}>
            <h1>{props.name}</h1>
            {props.email ? <p>{props.email}</p> : null}
          </div>
        </div>
        <div className={styles.secondary_info}>
          <ProfileLevel level={props.level} />
          <p>{props.bio ?? "Rate or be Rate"}</p>
          <p>Rated since: {new Date(props.created_at).getUTCFullYear()}</p>
        </div>
      </div>
      <h2 style={{ margin: "1.5rem 0 .5rem" }}>Posts</h2>
      {props.posts && props.posts.length ? (
        <div className={styles.posts}>
          {props.posts.map((post) => (
            <Post
              key={post.reply_id}
              {...post}
              author={{
                name: props.name,
                display_picture: props.display_picture,
              }}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}

// TODO: beautify this component
// thinking some loader with the level showing in it
function ProfileLevel(props: { level: number }) {
  return (
    <div className={styles.level}>
      <h2>Level {props.level}</h2>
    </div>
  );
}
