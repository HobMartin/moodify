"use client";

import { AuthSession } from "@/types/types";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const { data } = useSession();
  const session = data as AuthSession;
  const pathname = usePathname();
  const router = useRouter();
  const callbackUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
  const logout = () => {
    signOut({ callbackUrl: `${callbackUrl}/login` });
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full p-4 pl-10 rounded-lg bg-paper-700">
      <span></span>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 py-2 pl-2 pr-4 rounded-full bg-background-secondary bg-opacity-70">
          {session?.user.picture ? (
            <Image
              src={session?.user.picture as string}
              className="w-8 h-8 rounded-full"
              alt={session?.user?.name}
              height={32}
              width={32}
            />
          ) : (
            <></>
          )}
          <span className="text-sm font-bold tracking-wide">
            {session?.user.name}
          </span>
        </div>

        <button
          className="flex items-center justify-center bg-background-secondary bg-opacity-70 rounded-full h-10 w-10 hover:bg-[#181818] focus:outline-none cursor-pointer"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
