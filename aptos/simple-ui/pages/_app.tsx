import "@/styles/globals.css";

import { CacheProvider, EmotionCache, ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import type { AppProps } from "next/app";
import Head from "next/head";

import createEmotionCache from "@/lib/create-emotion-cache";
import theme from "@/lib/theme";

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}
export default function App({
  Component,
  pageProps,
  emotionCache,
}: MyAppProps) {
  if (emotionCache === undefined) {
    emotionCache = clientSideEmotionCache;
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <meta
          name="description"
          content="serverless simple ui for aux exchange"
        />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}
