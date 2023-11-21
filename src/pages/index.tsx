import Feed from "@/components/feed";
import { NavbarLayout } from "@/layouts/navbar";
import type { ReactElement } from "react";

export default function Home() {
  return <Feed />;
}

Home.getLayout = function (page: ReactElement) {
  return <NavbarLayout title="RateMySite">{page}</NavbarLayout>;
};
