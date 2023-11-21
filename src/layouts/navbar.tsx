import { NavBar } from "@/components/navbar";
import Head from "next/head";
import type { PropsWithChildren } from "react";

export const NavbarLayout = ({ title, children }: { title?: string } & PropsWithChildren) => {
  return (
    <>
      {title ? (
        <Head>
          <title>{title}</title>
        </Head>
      ) : null}
      <div className="page">
        <NavBar />
        {children}
      </div>
    </>
  );
};
