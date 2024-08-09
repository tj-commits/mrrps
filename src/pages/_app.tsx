import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import { SideNav } from "~/components/SideNav";
import { RightSideSection } from "~/components/RightSideSection";
import Link from "next/link";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { FormEvent, useRef, useState } from "react";
import { Button } from "~/components/Button";

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
        <link rel="shortcut icon" href="favicon.jpg" />
      </Head>

      <It Component={Component} {...pageProps} />

    </SessionProvider>
  );
};

function It({ Component, ...pageProps }: any) {
  const session = useSession()
  console.log(session)
  return <>
  {session.status === 'authenticated' && session.data!.user.name == null && (
    <FirstTimeSetup />
  )}
  {session.status === 'authenticated' && session.data!.user.name != null && (
    <>
      <div className="container mx-auto flex items-start sm:pr-4">
        <SideNav />
        <main className="min-h-screen flex-grow border-x">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  )}
  { session.status === 'unauthenticated' && (
    <Splash />
  )}
  { session.status === 'loading' && (
    <div className="flex justify-center items-center col h-screen">
      <img src="/favicon.jpg" alt="Mrrps logo" width="100" />
    </div>
  )}
  </>
}

function FirstTimeSetup() {
  const session = useSession()
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const { data } = api.profile.doesUserExistFromId.useQuery({ id })
  const [handleAvailable, setHandleAvailable] = useState('unavailable')
  const [image, setImage] = useState('')
  const updateProfile = api.profile.edit.useMutation({
    onSuccess: () => {
      console.log('mhm')
    }
  })
function checkHandleAvailable() {
    
      if (data) {
        setHandleAvailable('unavailable')
      } else {
        setHandleAvailable('available') 
      }
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (handleAvailable === 'unavailable') {
      alert('The handle you chose is unavailable!')
      return
    }
    updateProfile.mutate({ id: id, image: image, name: name, currentId: session.data!.user.id })
    location.reload()
  }
  return <div className="px-5 py-5 text-center">
  <h1 className="text-2xl">First Time Setup</h1>
  <p>You just created your account with Mrrps, now we need some info!</p>
  <hr />
  <br/>
  <form onSubmit={handleSubmit}>
    <div>
    <label htmlFor="name">What is your name?</label>&nbsp;&nbsp;
    <input required className="border-2 border-black py-1 px-1 w-20" type="text" name="name" id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} /></div><br /><div>
    <label htmlFor="image">Enter the URL of a profile picture:</label>&nbsp;&nbsp;
    <input required className="border-2 border-black py-1 px-1 w-96" type="url" name="image" id="image" placeholder="https://www.example.com/uploads/profile.png" value={image} onChange={(e) => setImage(e.target.value)} /></div><br /><div>
    <label htmlFor="id">Enter a handle:</label>&nbsp;&nbsp;{'@'}
    <input required name="id" id="id" type="text" className="border-2 border-black py-1 px-1 w-22" value={id} placeholder="johndoe" onChange={(e) => {
      setId(e.target.value)
      checkHandleAvailable()
    }} />
    <p>That handle is <span>{handleAvailable}</span></p>
    </div>
    <Button type="submit">OK</Button>
  </form>
</div>
}

function Splash() {
  return (
    <>
      <div className="grid min-h-screen grid-rows-[1fr,auto]">
        <main className="grid lg:grid-cols-[1fr,45vw]">
          <div className="relative hidden items-center justify-center lg:flex">
            <figure>
              <span className="absolute inset-0 m-0 box-border block h-[initial] w-[initial] overflow-hidden border-0 p-0 opacity-100">
                <img
                  alt="Mrrps banner"
                  src="/cool-cats.png"
                  decoding="async"
                  data-nimg="fill"
                  className="absolute inset-0 m-auto box-border block h-0 max-h-full min-h-full w-0 min-w-full max-w-full border-[none] object-cover object-cover p-0"
                />
              </span>
            </figure>
            <i className="absolute border-8 border-indigo-600 bg-pink-400/50">
              <img src="/pixelated.png" alt="Mrrps cat" />
            </i>
          </div>
          <div className="flex flex-col items-center justify-between gap-6 p-8 lg:items-start lg:justify-center">
            <i className="mb-0 self-center lg:mb-10 lg:self-auto">
              <img src="/favicon.jpg" alt="Mrrps logo" width="50" />
            </i>
            <div className="font-twitter-chirp-extended flex max-w-xs flex-col gap-4 lg:max-w-none lg:gap-16">
              <h1 className='text-3xl before:content-["What_the_cool_cats_are_doing."] lg:text-6xl lg:before:content-["What_the_cool_cats_are_doing"]'></h1>
            </div>
            <div className="flex max-w-xs flex-col gap-6 [&_button]:py-2">
              <div className="grid gap-3 font-bold">
                <button
                  className="custom-button main-tab border-light-line-reply text-light-primary flex justify-center gap-2 border px-5 py-5 font-bold transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75"
                  onClick={() => signIn()}
                  role="button"
                >
                  Sign in/sign up
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default api.withTRPC(MyApp);