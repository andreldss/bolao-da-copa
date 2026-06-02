"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ code }: { code: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function join() {
        setBusy(true);
        setError(null);
        const res = await fetch("/api/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) return setError(data.error);
        router.push(`/groups/${data.id}`);
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={join}
                disabled={busy}
                className="rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
                {busy ? "Entrando…" : "Entrar no bolão"}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
