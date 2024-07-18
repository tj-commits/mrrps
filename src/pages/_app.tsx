import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import { SideNav } from "~/components/SideNav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Mrrps - What the cool cats are doing</title>
        <meta
          name="description"
          content="Mrrps. Social media that's what the cool cats are doing."
        />
      </Head>
      <div className="container mx-auto flex items-start sm:pr-4">
        <SideNav />
        <main className="min-h-screen flex-grow border-x">
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
