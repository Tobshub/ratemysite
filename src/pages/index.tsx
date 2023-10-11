import Feed from "@/components/feed";
import { NavBar } from "@/components/navbar";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>RateMySite</title>
      </Head>
      <div className="page">
        <NavBar />
        <Feed />
      </div>
    </>
  );
}
