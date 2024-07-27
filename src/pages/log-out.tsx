import { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { Button } from "~/components/Button";

const LogOut: NextPage = () => {

  const session = useSession()

  if (session.status !== 'authenticated') location.replace('/')

  return <>
    {session.status === 'authenticated' && (<div className="px-5 py-5">
      <p className="text-2xl">Are you sure that you want to sign out?</p><br />
      <Button onClick={() => signOut()}>Yes</Button>
    </div>)}
  </>
}

export default LogOut