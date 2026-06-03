import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import InviteLink from "@/components/InviteLink";
import GroupOwnerMenu from "@/components/GroupOwnerMenu";
import LeaveGroup from "@/components/LeaveGroup";
import GroupTabs, { type Standing } from "@/components/GroupTabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pointsFor, POINTS_EXACT } from "@/lib/scoring";

type Group = { id: string; name: string; invite_code: string; is_open: boolean; owner_id: string };

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const [{ data: groupData }, { data: isMember }] = await Promise.all([
        supabaseAdmin.from("groups").select("id, name, invite_code, is_open, owner_id").eq("id", id).maybeSingle(),
        supabaseAdmin.from("group_members").select("group_id").eq("group_id", id).eq("player_id", user.id).maybeSingle(),
    ]);
    const group = groupData as Group | null;
    if (!group) redirect("/");
    if (!isMember) redirect("/");

    const [{ data: membersRaw }, { data: matchesRaw }, { data: predsRaw }] = await Promise.all([
        supabaseAdmin.from("group_members").select("player_id, profiles(name)").eq("group_id", id)
            .returns<{ player_id: string; profiles: { name: string } }[]>(),
        supabaseAdmin.from("matches").select("id, home_score, away_score").eq("status", "finished"),
        supabaseAdmin.from("predictions").select("player_id, match_id, home_score, away_score").eq("group_id", id),
    ]);

    const memberRows = (membersRaw ?? []).map((m) => ({
        player_id: m.player_id,
        name: m.profiles.name,
    }));
    const members = memberRows.map((r) => r.name);
    const matchesData = (matchesRaw ?? []) as { id: string; home_score: number; away_score: number }[];
    const predsData = (predsRaw ?? []) as { player_id: string; match_id: string; home_score: number; away_score: number }[];

    const results = new Map<string, { home: number; away: number }>();
    matchesData.forEach((m) => results.set(m.id, { home: m.home_score, away: m.away_score }));

    const table = new Map<string, Standing>();
    memberRows.forEach((m) =>
        table.set(m.player_id, { id: m.player_id, name: m.name, points: 0, exacts: 0 })
    );

    predsData.forEach((p) => {
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

    const isOwner = group.owner_id === user.id;

    return (
        <main className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600">
                    <ArrowLeft size={14} /> início
                </Link>
                {isOwner && <GroupOwnerMenu groupId={group.id} groupName={group.name} isOpen={group.is_open} />}
            </div>

            <div className="mb-1">
                <p className="mb-0.5 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {group.invite_code}
                </p>
                <h1 className="font-display text-4xl uppercase leading-tight">{group.name}</h1>
            </div>

            {isOwner && <div className="mt-5">
                <InviteLink code={group.invite_code} />
            </div>}

            <Link
                href={`/groups/${group.id}/bets`}
                className="mt-4 block rounded-xl bg-emerald-600 py-3 text-center font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
                ⚽ Fazer palpites
            </Link>

            <GroupTabs
                members={members}
                ranking={ranking}
                noPoints={noPoints}
                userId={user.id}
            />

            {!isOwner && (
                <div className="mt-10 flex justify-center">
                    <LeaveGroup groupId={group.id} />
                </div>
            )}
        </main>
    );
}
