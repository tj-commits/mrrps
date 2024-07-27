import { NextPage } from "next";
import { signOut } from "next-auth/react";
import { Button } from "~/components/Button";

const LogOut: NextPage = () => {
  return <>
    <div className="px-5 py-5">
      <p className="text-2xl">Are you sure that you want to sign out?</p><br />
      <Button onClick={() => signOut()}>Yes</Button>
    </div>
  </>
}

export default LogOut