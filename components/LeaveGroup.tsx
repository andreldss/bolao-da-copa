"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveGroup({ groupId }: { groupId: string }) {
    const router = useRouter();
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);

    async function leave() {
        setBusy(true);
        await fetch("/api/groups/leave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId }),
        });
        setBusy(false);
        router.push("/");
    }

    if (!confirm) {
        return (
            <button
                onClick={() => setConfirm(true)}
                className="text-sm text-slate-400 transition hover:text-red-500 active:opacity-75"
            >
                Sair do bolão
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Tem certeza?</span>
            <button
                onClick={leave}
                disabled={busy}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-40"
            >
                {busy ? "Saindo…" : "Sair"}
            </button>
            <button
                onClick={() => setConfirm(false)}
                className="text-sm text-slate-400 transition hover:text-slate-600 active:opacity-75"
            >
                Cancelar
            </button>
        </div>
    );
}
