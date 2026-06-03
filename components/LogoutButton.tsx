"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();
    async function sair() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
    }
    return (
        <button onClick={sair} className="flex gap-1 items-center rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:opacity-75 cursor-pointer" >
            sair <LogOut size={14} />
        </button>
    );
}
