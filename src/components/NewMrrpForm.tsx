import { useSession } from "next-auth/react";
import {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "~/utils/api";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import "react-toastify/dist/ReactToastify.css";
import BadWordsFilter from "bad-words";
import { ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import { v4 as uuidv4 } from 'uuid'

const badWords = new BadWordsFilter();

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

export function NewMrrpForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <Form />;
}

function Form() {
  const fileInputRef = useRef(null)
  const session = useSession();
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  const trpcUtils = api.useContext();

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const createMrrp = api.mrrp.create.useMutation({
    onSuccess: (newMrrp) => {
      setInputValue("");

      if (session.status !== "authenticated") return;

      trpcUtils.mrrp.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        const newCacheMrrp = {
          ...newMrrp,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          }
        };

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              mrrps: [newCacheMrrp, ...oldData.pages[0].mrrps],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  if (session.status !== "authenticated") return null;

  async function handleSubmit(e: FormEvent) {
    // The magic
    e.preventDefault();

    if (badWords.isProfane(inputValue)) {
      alert('Profanity not allowed')
      return;
    }
    //handleUpload()
    
    if (fileInputRef == null || fileInputRef.current == null) return
    const file = fileInputRef.current.files[0]
    const path = `images/${uuidv4()}${file.name}`
        const fileRef = ref(storage, path)
        await uploadBytes(fileRef, file)
        const image_url = 'https://firebasestorage.googleapis.com/v0/b/mrrps-eca1d.appspot.com/o/' + path.replace('/', '%2F') + '?alt=media'
    createMrrp.mutate({ content: inputValue, image_url });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e)=>{if(e.key === 'Enter') handleSubmit(e) }}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's up?"
        />
      </div>
      <input className="self-end" ref={fileInputRef} type='file' name='file' />
      <Button className="self-end">Mrrp</Button>
    </form>
  );
}
