"use client";
import { useState } from "react";

export type Standing = { id: string; name: string; points: number; exacts: number };

export default function GroupTabs({
    members,
    ranking,
    noPoints,
    userId,
}: {
    members: string[];
    ranking: Standing[];
    noPoints: boolean;
    userId: string;
}) {
    const [tab, setTab] = useState<"ranking" | "members">("ranking");

    return (
        <div className="mt-6">
            <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
                <button
                    onClick={() => setTab("ranking")}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition active:opacity-75 cursor-pointer ${tab === "ranking" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Ranking
                </button>
                <button
                    onClick={() => setTab("members")}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition active:opacity-75 cursor-pointer ${tab === "members" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Participantes ({members.length})
                </button>
            </div>

            {tab === "ranking" && (
                noPoints ? (
                    <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-black/5">
                        Nenhum jogo encerrado ainda. O ranking aparece quando sair o primeiro resultado.
                    </p>
                ) : (
                    <ol className="space-y-2">
                        {ranking.map((s, i) => (
                            <li
                                key={s.id}
                                className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${s.id === userId ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-black/5"}`}
                            >
                                <span className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                                <span className="flex-1 truncate font-semibold">{s.name}</span>
                                {s.exacts > 0 && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                        {s.exacts}× cravou
                                    </span>
                                )}
                                <span className="text-lg font-black">{s.points} pts</span>
                            </li>
                        ))}
                    </ol>
                )
            )}

            {tab === "members" && (
                <ul className="space-y-2">
                    {members.map((name, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                {name.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium">{name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
