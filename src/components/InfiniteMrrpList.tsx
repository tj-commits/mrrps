import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";

type Mrrp = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: {
    id: string;
    image: string | null;
    name: string | null;
  };
};

type InfiniteMrrpListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewMrrps: () => Promise<unknown>;
  mrrps?: Mrrp[];
};

export function InfiniteMrrpList({
  mrrps,
  isError,
  isLoading,
  fetchNewMrrps,
  hasMore,
}: InfiniteMrrpListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return <h1>ERROR!</h1>;
  }
  if (mrrps == null) return null;

  if (mrrps == null || mrrps?.length === 0) {
    return (
      <h2 className="text-2x1 my-4 text-center text-gray-500">No mrrps</h2>
    );
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={mrrps.length}
        next={fetchNewMrrps}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {mrrps.map((mrrp) => {
          return <MrrpCard key={mrrp.id} {...mrrp} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function MrrpCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Mrrp) {
  const trpcUtils = api.useContext();
  const toggleLike = api.mrrp.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.mrrp.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              mrrps: page.mrrps.map((mrrp) => {
                if (mrrp.id === id) {
                  return {
                    ...mrrp,
                    likeCount: mrrp.likeCount + countModifier,
                    likedByMe: addedLike,
                  };
                }

                return mrrp;
              }),
            };
          }),
        };
      };

      trpcUtils.mrrp.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.mrrp.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
      trpcUtils.mrrp.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData
      );
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }
  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500"></span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      </div>
    </li>
  );
}

type HeartButtonProps = {
  likedByMe: boolean;
  likeCount: number;
  isLoading: boolean;
  onClick: () => void;
};

function HeartButton({
  isLoading,
  onClick,
  likedByMe,
  likeCount,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "focus-visible:text-red 500 text-gray-500 hover:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? "fill-red-500"
              : "fill-gray:500 group-hover:fill-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}