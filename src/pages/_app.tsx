import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { createTheme, ThemeProvider } from "@mui/material";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "@/styles/globals.css";
import { PopulateUserStore } from "@/utils/populate-store";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

const theme = createTheme({ palette: { mode: "dark" } });

const MyApp: AppType = ({ Component, pageProps }) => {
  PopulateUserStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = usePathname();
  useEffect(() => {
    if (searchParams.get("reload")) {
      router.push(url).then((ok) => (ok ? router.reload() : null));
    }
  }, [searchParams, router, url]);

  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
