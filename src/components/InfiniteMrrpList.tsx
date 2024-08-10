import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled, VscTrash } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { MrrpCard } from './MrrpCard'
import { Comment } from "@prisma/client";

export type Mrrp = {
  id: string;
  content: string;
  image_url: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: {
    id: string;
    image: string | null;
    name: string | null;
  };
  comments: Comment[]
};

type InfiniteMrrpListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewMrrps: () => Promise<unknown>;
  mrrps?: Mrrp[];
  onlyFollowing: boolean;
};

export function InfiniteMrrpList({
  mrrps,
  isError,
  isLoading,
  fetchNewMrrps,
  hasMore,
  onlyFollowing,
}: InfiniteMrrpListProps) {
  if (isLoading) return <div className="flex h-full justify-center items-center"><LoadingSpinner /></div>;
  if (isError) {
    return <h1>ERROR!</h1>;
  }
  if (mrrps == null) return null;

  if (mrrps == null || mrrps?.length === 0) {
    return (
      <h2 className="text-2x1 my-4 text-center text-gray-500">
        {onlyFollowing === true
          ? "You are not following any accounts yet. To follow someone, visit their profile page by clicking on their profile picture, and click Follow."
          : "Search results will show up here"}
      </h2>
    );
  }

  if (hasMore == null) hasMore = false;

  return (
    <ul>
      <InfiniteScroll
        dataLength={mrrps.length}
        next={fetchNewMrrps}
        hasMore={hasMore}
        loader={<div className="flex h-full justify-center items-center"><LoadingSpinner /></div>}
      >
        {mrrps.map((mrrp) => {
          return <MrrpCard key={mrrp.id} {...mrrp} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

