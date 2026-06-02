import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";

type Jogo = {
    id: string;
    round_label: string;
    group_label: string | null;
    team1: string;
    team2: string;
    kickoff: string;
};

export default async function MatchesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data } = await supabase
        .from("matches")
        .select("id, round_label, group_label, team1, team2, kickoff")
        .order("kickoff", { ascending: true });

    const jogos = (data ?? []) as Jogo[];

    return (
        <main className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tight">Jogos</h1>
                <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition">← início</Link>
            </div>
            <div className="space-y-3">
                {jogos.map((j) => (
                    <div key={j.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                        <p className="mb-2 text-xs font-medium text-slate-400">
                            {j.group_label
                                ? `Grupo ${j.group_label.replace("Group ", "")}`
                                : j.round_label}{" "}
                            · {formatDateTime(j.kickoff)}
                        </p>
                        <p className="font-semibold">
                            {j.team1} <span className="text-slate-400">×</span> {j.team2}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}
