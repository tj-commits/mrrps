import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { IconHoverEffect } from "./IconHoverEffect";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";

export function SideNav() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <nav className="sticky top-0 px-2 py-4">
      <menu className="flex flex-col items-start gap-2 whitespace-nowrap items-center justify-center md:justify-start md:items-start">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <img src="/favicon.jpg" alt="Mrrps logo" width="100" />
                {/*<span className="hidden text-lg text-blue-700 md:inline">
                  Mrrps
                </span>*/}
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        <li>
        <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscHome className="h-8 w-8 fill-blue-700" />
                <span className="hidden text-lg text-blue-700 md:inline">
                  Feed
                </span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        {user != null && (
          <li>
            <Link href={`/profiles/${user.id}`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscAccount className="h-8 w-8 fill-orange-400" />
                  <span className="hidden text-lg text-orange-400 md:inline">
                    Profile
                  </span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}
        {user == null ? (
          <li>
            <button onClick={() => void signIn()}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscSignIn className="h-8 w-8 fill-green-700" />
                  <span className="hidden text-lg text-green-700 md:inline">
                    Sign In
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        ) : (
          <li>
            <button onClick={() => void signOut()}>
            <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscSignOut className="h-8 w-8 fill-red-700" />
                  <span className="hidden text-lg text-red-700 md:inline">
                    Sign Out
                  </span>
                </span>
              </IconHoverEffect>
              
            </button>
          </li>
        )}
      </menu>
    </nav>
  );
}
