"use client";
import { useEffect, useState } from "react";

export default function InviteLink({ code }: { code: string }) {
    const [url, setUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setUrl(`${window.location.origin}/join/${code}`);
    }, [code]);

    async function copy() {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Link de convite</p>
            <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {url || `…/join/${code}`}
                </code>
                <button
                    onClick={copy}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition cursor-pointer ${copied ? "bg-emerald-100 text-emerald-700" : "bg-slate-800 text-white hover:bg-slate-700 active:scale-95"}`}
                >
                    {copied ? "copiado!" : "copiar"}
                </button>
            </div>
        </div>
    );
}
