import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { InfiniteMrrpList } from "~/components/InfiniteMrrpList";
import { NewMrrpForm } from "~/components/NewMrrpForm";
import { api } from "~/utils/api";

const TABS = ["Recent", "Following"] as const;

const Home: NextPage = () => {
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");
  const session = useSession();
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">
          Mrrps - Social media by{" "}
          <Link
            href="https://www.rafdo.rf.gd"
            className="text-blue-700 underline"
          >
            Rafdo
          </Link>
        </h1>
      </header>
      <NewMrrpForm />
      {session.status === "authenticated" && (
        <div className="flex">
          {TABS.map((tab) => {
            return (
              <button
                key={tab}
                className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${
                  tab === selectedTab
                    ? "border-b-4 border-b-blue-50 font-bold"
                    : ""
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}
      {selectedTab === "Recent" ? <RecentMrrps /> : <FollowingMrrps />}
    </>
  );
};

function RecentMrrps() {
  const mrrps = api.mrrp.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteMrrpList
      mrrps={mrrps.data?.pages.flatMap((page) => page.mrrps)}
      isError={mrrps.isError}
      isLoading={mrrps.isLoading}
      hasMore={mrrps.hasNextPage}
      fetchNewMrrps={mrrps.fetchNextPage}
      onlyFollowing={false}
    />
  );
}

function FollowingMrrps() {
  const mrrps = api.mrrp.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteMrrpList
      mrrps={mrrps.data?.pages.flatMap((page) => page.mrrps)}
      isError={mrrps.isError}
      isLoading={mrrps.isLoading}
      hasMore={mrrps.hasNextPage}
      fetchNewMrrps={mrrps.fetchNextPage}
      onlyFollowing={true}
    />
  );
}

export default Home;
