"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={() =>
          authClient.signIn.social({
            provider: "github",
            callbackURL: "/dashboard",
          })
        }
        className="rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
      >
        Entrar com GitHub
      </button>
    </div>
  );
}