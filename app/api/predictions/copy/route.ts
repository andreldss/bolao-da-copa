import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Faça login" }, { status: 401 });

    const body = (await request.json()) as { sourceGroupId?: string; targetGroupId?: string };
    const { sourceGroupId, targetGroupId } = body;
    if (!sourceGroupId || !targetGroupId) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

    const [{ data: srcMember }, { data: tgtMember }] = await Promise.all([
        supabaseAdmin.from("group_members").select("group_id").eq("group_id", sourceGroupId).eq("player_id", user.id).maybeSingle(),
        supabaseAdmin.from("group_members").select("group_id").eq("group_id", targetGroupId).eq("player_id", user.id).maybeSingle(),
    ]);
    if (!srcMember) return NextResponse.json({ error: "Você não está no bolão de origem" }, { status: 403 });
    if (!tgtMember) return NextResponse.json({ error: "Você não está no bolão de destino" }, { status: 403 });

    const { data: preds } = await supabaseAdmin
        .from("predictions")
        .select("match_id, home_score, away_score")
        .eq("group_id", sourceGroupId)
        .eq("player_id", user.id);

    if (!preds?.length) return NextResponse.json({ copied: 0 });

    // só jogos ainda não iniciados
    const { data: openMatches } = await supabaseAdmin
        .from("matches")
        .select("id")
        .gt("kickoff", new Date().toISOString())
        .in("id", preds.map((p) => p.match_id));

    const openIds = new Set((openMatches ?? []).map((m) => m.id));
    const toCopy = preds.filter((p) => openIds.has(p.match_id));

    if (!toCopy.length) return NextResponse.json({ copied: 0 });

    const { error } = await supabaseAdmin.from("predictions").upsert(
        toCopy.map((p) => ({
            group_id: targetGroupId,
            player_id: user.id,
            match_id: p.match_id,
            home_score: p.home_score,
            away_score: p.away_score,
            updated_at: new Date().toISOString(),
        })),
        { onConflict: "group_id,player_id,match_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ copied: toCopy.length });
}
