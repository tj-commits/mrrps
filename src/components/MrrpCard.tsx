import { useSession } from 'next-auth/react';
import { Mrrp } from './InfiniteMrrpList'
import { api } from '~/utils/api';
import Link from 'next/link';
import { ProfileImage } from './ProfileImage';
import { VscComment, VscHeart, VscHeartFilled, VscTrash } from 'react-icons/vsc';
import { IconHoverEffect } from './IconHoverEffect';
import { NewCommentForm } from './NewCommentForm';
import { useReducer, useState } from 'react';



export function MrrpCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
  image_url,
  comments
}: Mrrp) {
  console.log(comments)
  // This opens and closes the comments section by having a state that alternates from "hidden" to nothing so that the comments section can be hidden or not hidden
  

const [commentsSectionOpenClass, setCommentsSectionOpenClass] = useState("hidden")
  const session = useSession();
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

  const deleteMrrp = api.mrrp.delete.useMutation({
    onSuccess: () => {
      const updateData: Parameters<
        typeof trpcUtils.mrrp.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              mrrps: page.mrrps.filter((mrrp) => {
                return mrrp.id !== id;
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

  

  function handleDelete() {
    const shouldIDelete1 = confirm('Are you sure that you want to delete this mrrp? Deletion is permanent.')
    if (!shouldIDelete1) return
    deleteMrrp.mutate({ id });
  }


  const condition =
    session.status === "authenticated" && session.data.user.id === user.id;
  return (
    <>
    <li className="border-b">
      <div className="flex gap-4 px-4 py-4">
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
          <Link
            href={`/profiles/${user.id}`}
            className=" text-gray-500 outline-none"
          >
            @{user.id}
          </Link>
          <span className="text-gray-500">
            
          {" "}&bull;{" "}
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="text-lg whitespace-pre-wrap">{content}</p>
        {image_url !== "" && (
          <img src={image_url} alt="Image uploaded by user" width="500" />
        )}
        <div className="flex flex-row">
          <HeartButton
            onClick={handleToggleLike}
            isLoading={toggleLike.isLoading}
            likedByMe={likedByMe}
            likeCount={likeCount}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <DeleteButton
            isLoading={deleteMrrp.isLoading}
            onClick={handleDelete}
            condition={condition}
          />
          &nbsp;&nbsp;
          <CommentButton
            isLoading={false}
            onClick={() => setCommentsSectionOpenClass(commentsSectionOpenClass === "hidden" ? "" : "hidden")}
          />
        </div>
      </div>
      </div>
      <CommentsSection mrrpId={id} comments={comments} commentsSectionOpenClass={commentsSectionOpenClass} setCommentsSectionOpenClass={setCommentsSectionOpenClass} />
    </li>
    </>
  );
}



const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function CommentsSection({ comments, mrrpId, commentsSectionOpenClass, setCommentsSectionOpenClass }: any) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  return <div className={`flex gap-4 px-4 py-4 flex-col ${commentsSectionOpenClass}`}>
    <NewCommentForm mrrpId={mrrpId} reloadComments={() => {
      console.log('new comment')
      forceUpdate()
    }} />
    <hr />
    <h3 className="text-lg">Comments</h3>
    {comments.map((comment: any) => {
const commentUser = api.profile.getById.useQuery({ id: comment.userId}).data
return (
  <>
  <div className="flex items-center gap-4">
    <Link href={`/profiles/${comment.userId}`}>
    <ProfileImage src={commentUser?.image} /></Link>
  <p>{comment.body}</p>
  </div>
  </>
)  
})}
  </div>
}

type HeartButtonProps = {
  likedByMe: boolean;
  likeCount: number;
  isLoading: boolean;
  onClick: () => void;
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  compactDisplay: 'short'
})

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
        <span>{numberFormatter.format(likeCount)}</span>
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

type DeleteButtonProps = {
  isLoading: boolean;
  onClick: () => void;
  condition: boolean;
};

function DeleteButton({ isLoading, onClick, condition }: DeleteButtonProps) {

  if (condition === false) {
    return <></>;
  }

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className="group -ml-2 flex items-center gap-1 self-start text-red-500"
    >
      <IconHoverEffect red>
        <VscTrash className="fill-red-500" />
      </IconHoverEffect>
    </button>
  );
}

type CommentButtonProps = {
  isLoading: boolean;
  onClick: () => void;
}

function CommentButton({ isLoading, onClick }: CommentButtonProps) {
  return <button
  disabled={isLoading}
  onClick={onClick}
  className="group -ml-2 flex items-center gap-1 self-start text-green-500"
>
  <IconHoverEffect>
    <VscComment className="fill-green-500" />
  </IconHoverEffect>
</button>
}