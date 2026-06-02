"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleOpen({ groupId, isOpen }: { groupId: string; isOpen: boolean }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function alternar() {
        setBusy(true);
        await fetch("/api/groups/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId }),
        });
        setBusy(false);
        router.refresh();
    }

    return (
        <button
            onClick={alternar}
            disabled={busy}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition active:opacity-75 disabled:opacity-40 cursor-pointer ${isOpen ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
        >
            {isOpen ? "Fechar grupo" : "Reabrir grupo"}
        </button>
    );
}
