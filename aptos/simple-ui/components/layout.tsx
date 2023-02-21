import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Layout({
  children,
  home,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <meta
          name="description"
          content="serverless simple ui for aux exchange"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container-xxl">
          <Image
            className="navbar-brand"
            src="/favicon.svg"
            alt="aux exchange"
            priority
            height={32}
            width={32}
          />
          {!home && (
            <div className="collapse navbar-collapse">
              <div className="navbar-nav">
                <Link href="/" className="nav-link">
                  Pools
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      {children}
    </>
  );
}
