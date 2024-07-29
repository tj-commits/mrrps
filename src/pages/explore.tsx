import { NextPage } from "next";
import Link from "next/link";
import { FormEvent, useCallback, useRef, useState } from "react";
import { Button } from "~/components/Button";
import { InfiniteMrrpList } from "~/components/InfiniteMrrpList";
import { api } from "~/utils/api";

const Explore: NextPage = () => {
  const [search, setSearch] = useState("")
  const [inputValue, setInputValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>();
  const inputRef = useCallback((input: HTMLInputElement) => {
    searchInputRef.current = input;
  }, []);
  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setSearch(inputValue)
  }
  return <>
    <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">
          Search Mrrps
        </h1>
      </header>
    <div className="px-3 py-3 flex flex-col justify-center items-center">
    <form action="#" onSubmit={handleSubmit}>
      <input type="text" placeholder="Search" ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="border-4 px-2 py-2 w-36 md:w-128" required />{"  "}
      <Button type="submit">Search</Button>
    </form>
    </div>

    <SearchResults search={search} />
  </>
}

function SearchResults({ search }: { search: string }) {
  const mrrps = api.mrrp.infiniteSearchFeed.useInfiniteQuery(
    { search },
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

export default Explore