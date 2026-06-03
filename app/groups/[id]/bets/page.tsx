import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import BetsBoard, { type MatchBet, type MyPick } from "@/components/BetsBoard";
import CopyBets from "@/components/CopyBets";
import { ArrowLeft } from "lucide-react";

type MatchRow = {
    id: string;
    round_label: string;
    group_label: string | null;
    team1: string;
    team2: string;
    kickoff: string;
    status: string | null;
    home_score: number | null;
    away_score: number | null;
};

export default async function BetsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: member } = await supabaseAdmin
        .from("group_members").select("group_id").eq("group_id", id).eq("player_id", user.id).maybeSingle();
    if (!member) redirect("/groups");

    const [{ data: matchesData }, { data: predsData }, { data: groupsRaw }] = await Promise.all([
        supabaseAdmin.from("matches")
            .select("id, round_label, group_label, team1, team2, kickoff, status, home_score, away_score")
            .order("kickoff", { ascending: true }),
        supabaseAdmin.from("predictions")
            .select("match_id, home_score, away_score")
            .eq("group_id", id)
            .eq("player_id", user.id),
        supabaseAdmin.from("group_members")
            .select("groups(id, name)")
            .eq("player_id", user.id),
    ]);

    const otherGroups = (groupsRaw ?? [])
        .flatMap((r) => r.groups as { id: string; name: string }[])
        .filter((g) => g.id !== id);

    const now = Date.now();
    const matches: MatchBet[] = ((matchesData ?? []) as MatchRow[]).map((m) => ({
        ...m,
        locked: new Date(m.kickoff).getTime() <= now,
    }));

    const myPicks: Record<string, MyPick> = {};
    ((predsData ?? []) as { match_id: string; home_score: number; away_score: number }[]).forEach((p) => {
        myPicks[p.match_id] = { home: p.home_score, away: p.away_score };
    });

    return (
        <main className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">
            <Link href={`/groups/${id}`} className="flex items-center gap-1 mb-4 text-sm text-slate-400 hover:text-slate-600 transition">
                <ArrowLeft size={14} /> voltar ao grupo
            </Link>
            <div className="mb-5 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-black tracking-tight">Palpites</h1>
                <CopyBets groups={otherGroups} targetGroupId={id} />
            </div>
            <BetsBoard matches={matches} myPicks={myPicks} groupId={id} />
        </main>
    );
}
