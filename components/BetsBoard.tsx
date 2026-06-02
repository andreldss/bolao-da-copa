"use client";
import { useState } from "react";
import { formatDateTime } from "@/lib/format";

export type MatchBet = {
    id: string;
    round_label: string;
    group_label: string | null;
    team1: string;
    team2: string;
    kickoff: string;
    locked: boolean;
    status: string | null;
    home_score: number | null;
    away_score: number | null;
};
export type MyPick = { home: number; away: number };

export default function BetsBoard({
    matches,
    myPicks,
    groupId,
}: {
    matches: MatchBet[];
    myPicks: Record<string, MyPick>;
    groupId: string;
}) {
    const [tab, setTab] = useState<"open" | "closed">("open");

    const open = matches.filter((m) => m.status !== "finished");
    const closed = matches.filter((m) => m.status === "finished");
    const list = tab === "open" ? open : closed;

    return (
        <div>
            <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
                <button
                    onClick={() => setTab("open")}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition active:opacity-75 cursor-pointer ${tab === "open" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Abertos ({open.length})
                </button>
                <button
                    onClick={() => setTab("closed")}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition active:opacity-75 cursor-pointer ${tab === "closed" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Encerrados ({closed.length})
                </button>
            </div>

            {list.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-black/5">
                    {tab === "open" ? "Nenhum jogo aberto para palpite." : "Nenhum jogo encerrado ainda."}
                </p>
            ) : (
                <div className="space-y-3">
                    {list.map((m) => (
                        <Bet key={m.id} match={m} groupId={groupId} initial={myPicks[m.id]} />
                    ))}
                </div>
            )}
        </div>
    );
}

function Bet({ match, groupId, initial }: { match: MatchBet; groupId: string; initial?: MyPick }) {
    const [home, setHome] = useState(initial?.home ?? 0);
    const [away, setAway] = useState(initial?.away ?? 0);
    const [saved, setSaved] = useState<MyPick | null>(initial ?? null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dirty = !saved || saved.home !== home || saved.away !== away;

    async function save() {
        setSaving(true);
        setError(null);
        const res = await fetch("/api/predictions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId, matchId: match.id, home, away }),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) return setError(data.error);
        setSaved({ home, away });
    }

    const label = match.group_label
        ? `Grupo ${match.group_label.replace("Group ", "")}`
        : match.round_label;

    const isFinished = match.status === "finished" && match.home_score != null;

    return (
        <div className={`rounded-2xl p-4 ring-1 ${isFinished ? "bg-slate-50 ring-slate-200" : "bg-white ring-black/5 shadow-sm"}`}>
            <p className="mb-3 text-xs font-medium text-slate-400">{label} · {formatDateTime(match.kickoff)}</p>

            {isFinished ? (
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
                    <span className="truncate">{match.team1}</span>
                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <span className="rounded-lg bg-slate-200 px-3 py-1 text-lg font-black text-slate-900">
                            {match.home_score} – {match.away_score}
                        </span>
                        <span className="text-xs font-normal text-slate-400">
                            {saved ? `seu: ${saved.home}–${saved.away}` : "sem palpite"}
                        </span>
                    </div>
                    <span className="truncate text-right">{match.team2}</span>
                </div>
            ) : match.locked ? (
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{match.team1}</span>
                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <span className="text-xs text-slate-400">🔒 em andamento</span>
                        <span className="text-xs text-slate-400">
                            {saved ? `seu: ${saved.home}–${saved.away}` : "sem palpite"}
                        </span>
                    </div>
                    <span className="font-semibold">{match.team2}</span>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{match.team1}</span>
                        <Stepper value={home} onChange={setHome} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{match.team2}</span>
                        <Stepper value={away} onChange={setAway} />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        onClick={save}
                        disabled={saving || !dirty}
                        className="mt-1 w-full rounded-xl bg-emerald-600 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                        {saving ? "salvando…" : dirty ? (saved ? "Atualizar palpite" : "Salvar palpite") : "Palpite salvo"}
                    </button>
                </div>
            )}
        </div>
    );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onChange(Math.max(0, value - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-lg font-bold transition hover:border-emerald-400 active:bg-emerald-50"
            >
                −
            </button>
            <span className="w-7 text-center text-lg font-black">{value}</span>
            <button
                onClick={() => onChange(Math.min(30, value + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-lg font-bold transition hover:border-emerald-400 active:bg-emerald-50"
            >
                +
            </button>
        </div>
    );
}
