"use client";
import { useState } from "react";

type Group = { id: string; name: string };

export default function CopyBets({ groups, targetGroupId }: { groups: Group[]; targetGroupId: string }) {
    const [selected, setSelected] = useState<Group | null>(null);
    const [busy, setBusy] = useState(false);

    if (groups.length === 0) return null;

    async function copy() {
        if (!selected) return;
        setBusy(true);
        await fetch("/api/predictions/copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourceGroupId: selected.id, targetGroupId }),
        });
        setBusy(false);
        setSelected(null);
        window.location.reload();
    }

    return (
        <>
            <select
                value=""
                onChange={(e) => {
                    const g = groups.find((g) => g.id === e.target.value);
                    if (g) setSelected(g);
                }}
                className="cursor-pointer rounded-lg bg-slate-200 px-2 py-1 text-xs font-medium text-slate-500 outline-none transition hover:bg-slate-200"
            >
                <option value="" disabled>copiar de...</option>
                {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                ))}
            </select>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8 sm:items-center sm:pb-0">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-black">Copiar palpites</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Todos os palpites abertos de{" "}
                            <span className="font-semibold text-slate-700">"{selected.name}"</span>{" "}
                            serão salvos neste bolão de uma vez.
                        </p>
                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => setSelected(null)}
                                className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:opacity-75 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={copy}
                                disabled={busy}
                                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                            >
                                {busy ? "Salvando…" : "Copiar e salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
