import { NextPage } from "next";
import { useSession } from "next-auth/react";

export let sessionbrobro: any

const S: NextPage = () => {
  const sessions = useSession()
  sessionbrobro = sessions
  return <h1>
    hi
  </h1>
}

export default S