import { type AppProps, type AppType } from "next/app";

import { api } from "@/utils/api";
import { createTheme, ThemeProvider } from "@mui/material";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "@/styles/globals.css";
import { PopulateUserStore } from "@/utils/populate-store";
import { type ReactElement, type ReactNode, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import type { NextPage } from "next";

const theme = createTheme({ palette: { mode: "dark" } });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const MyApp: AppType = ({ Component, pageProps }: AppProps & { Component: NextPageWithLayout }) => {
  PopulateUserStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = usePathname();
  useEffect(() => {
    if (searchParams.get("reload")) {
      router
        .push(url)
        .then((ok) => (ok ? router.reload() : null))
        .catch(null);
    }
  }, [searchParams, router, url]);

  const getLayout = Component.getLayout ?? ((page) => page);

  return <ThemeProvider theme={theme}>{getLayout(<Component {...pageProps} />)}</ThemeProvider>;
};

export default api.withTRPC(MyApp);
