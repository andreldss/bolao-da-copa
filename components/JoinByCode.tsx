"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinByCode() {
    const [code, setCode] = useState("");
    const router = useRouter();

    function entrar() {
        const c = code.trim().toUpperCase();
        if (!c) return;
        router.push(`/join/${c}`);
    }

    return (
        <div className="flex gap-2">
            <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && entrar()}
                placeholder="código do bolão"
                maxLength={8}
                className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 font-mono text-sm uppercase tracking-widest outline-none transition focus:border-emerald-500"
            />
            <button
                onClick={entrar}
                disabled={!code.trim()}
                className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-white transition hover:bg-slate-700 active:scale-95 disabled:opacity-40"
            >
                Entrar
            </button>
        </div>
    );
}
