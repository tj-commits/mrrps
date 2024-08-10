import { useSession } from "next-auth/react";
import { ProfileImage } from "./ProfileImage";
import { Button } from "./Button";
import { FormEvent, useState } from "react";
import { api } from "~/utils/api";

type NewCommentFormProps = {
  mrrpId: string;
  reloadComments: () => void;
}

export function NewCommentForm({ mrrpId, reloadComments }: NewCommentFormProps) {
  const [inputValue, setInputValue] = useState("");
  const trpcUtils = api.useContext();
  const session = useSession()
  const createComment = 
  api.comment.create.useMutation({
    onSuccess: (newComment) => {
      setInputValue("")

      if (session.status !== "authenticated") return;
      reloadComments()
    }
  })
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (inputValue === "") return
    createComment.mutate({ mrrpId, body: inputValue })
  }
  return <>
    <form onSubmit={handleSubmit} className="flex gap-4">
      <ProfileImage src={useSession().data!.user.image} />
      <input type="text" placeholder="Enter a comment" required aria-required className=" outline-none" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <button type="submit" className="bg-blue-500 text-white px-4 rounded-md text-md">Comment</button>
    </form>
  </>
}