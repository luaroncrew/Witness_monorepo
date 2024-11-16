"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

export const SignIn = () => {
  const { data: session } = useSession();

  return session ? (
    <Button onClick={() => signOut()} className="text-white bg-yellow-600">
      Sign out
    </Button>
  ) : (
    <Button className="bg-yellow-600" onClick={() => signIn("worldcoin")}>
      Sign in
    </Button>
  );
};
