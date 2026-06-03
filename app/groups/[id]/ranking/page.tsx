import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pointsFor, POINTS_EXACT } from "@/lib/scoring";

type Standing = { id: string; name: string; points: number; exacts: number };

export default async function RankingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: member } = await supabaseAdmin
        .from("group_members").select("group_id").eq("group_id", id).eq("player_id", user.id).maybeSingle();
    if (!member) redirect("/groups");

    const { data: membersData } = await supabaseAdmin
        .from("group_members")
        .select("player_id, profiles(name)")
        .eq("group_id", id)
        .returns<{ player_id: string; profiles: { name: string } }[]>();

    const { data: matchesData } = await supabaseAdmin
        .from("matches")
        .select("id, home_score, away_score")
        .eq("status", "finished")
        .returns<{ id: string; home_score: number; away_score: number }[]>();

    const { data: predsData } = await supabaseAdmin
        .from("predictions")
        .select("player_id, match_id, home_score, away_score")
        .eq("group_id", id)
        .returns<{ player_id: string; match_id: string; home_score: number; away_score: number }[]>();

    const results = new Map<string, { home: number; away: number }>();
    (matchesData ?? []).forEach((m) => results.set(m.id, { home: m.home_score, away: m.away_score }));

    const table = new Map<string, Standing>();
    (membersData ?? []).forEach((m) =>
        table.set(m.player_id, { id: m.player_id, name: m.profiles.name, points: 0, exacts: 0 })
    );

    (predsData ?? []).forEach((p) => {
        const r = results.get(p.match_id);
        const s = table.get(p.player_id);
        if (!r || !s) return;
        const pts = pointsFor(p.home_score, p.away_score, r.home, r.away);
        s.points += pts;
        if (pts === POINTS_EXACT) s.exacts += 1;
    });

    const ranking = [...table.values()].sort(
        (a, b) => b.points - a.points || b.exacts - a.exacts || a.name.localeCompare(b.name)
    );

    const noPoints = ranking.every((s) => s.points === 0);

    return (
        <main className="mx-auto max-w-md px-4 py-6">
            <h1 className="mb-1 text-2xl font-bold">Ranking</h1>
            <p className="mb-4 text-sm text-gray-500">Placar exato = 3 pts · resultado certo = 1 pt</p>

            {noPoints ? (
                <p className="text-gray-500">
                    Ainda não rolou jogo encerrado. O ranking acende quando sair o primeiro resultado.
                </p>
            ) : (
                <ol className="space-y-2">
                    {ranking.map((s, i) => (
                        <li key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <span className="w-6 text-center font-bold text-gray-400">{i + 1}</span>
                            <span className="flex-1 truncate font-medium">{s.name}</span>
                            {s.exacts > 0 && <span className="text-xs text-green-600">{s.exacts}× cravou</span>}
                            <span className="text-lg font-bold">{s.points}</span>
                        </li>
                    ))}
                </ol>
            )}
        </main>
    );
}