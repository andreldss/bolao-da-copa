"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinByCode() {
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function join() {
        const c = code.trim().toUpperCase();
        if (!c) return;
        setBusy(true);
        setError(null);
        const res = await fetch("/api/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: c }),
        });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) return setError(data.error);
        router.push(`/groups/${data.id}`);
    }

    return (
        <div>
            <div className="flex gap-2">
                <input
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && join()}
                    placeholder="código do bolão"
                    maxLength={8}
                    className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 font-mono text-sm uppercase tracking-widest outline-none transition focus:border-emerald-500"
                />
                <button
                    onClick={join}
                    disabled={!code.trim() || busy}
                    className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-white transition hover:bg-slate-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                    {busy ? "…" : "Entrar"}
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
