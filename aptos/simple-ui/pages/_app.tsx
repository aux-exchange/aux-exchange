import "bootstrap/dist/css/bootstrap.css";
import "@/styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  });
  return <Component {...pageProps} />;
}
