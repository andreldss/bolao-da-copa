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
                className="flex gap-1 items-center rounded-lg border border-red-600 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:opacity-75 cursor-pointer"
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
                className="flex gap-1 items-center rounded-lg border border-red-600 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:opacity-75 cursor-pointer"
            >
                {busy ? "Saindo…" : "Sair"}
            </button>
            <button
                onClick={() => setConfirm(false)}
                className="text-sm text-slate-400 transition hover:text-slate-600 active:opacity-75 cursor-pointer"
            >
                Cancelar
            </button>
        </div>
    );
}
