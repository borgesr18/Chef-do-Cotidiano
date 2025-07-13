// components/ui/Header.tsx
"use client";

import { User } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Header({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
      <h2 className="text-lg font-semibold">Chef do Cotidiano</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user.email}</span>
        <Image
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
          width={32}
          height={32}
          alt="avatar"
          className="rounded-full"
        />
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Sair
        </button>
      </div>
    </header>
  );
}
