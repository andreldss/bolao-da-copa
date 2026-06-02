import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Faça login" }, { status: 401 });

    const body = (await request.json()) as {
        groupId?: string;
        matchId?: string;
        home?: number;
        away?: number;
    };
    const { groupId, matchId } = body;
    const home = Number(body.home);
    const away = Number(body.away);

    if (!groupId || !matchId) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0 || home > 30 || away > 30) {
        return NextResponse.json({ error: "Placar inválido" }, { status: 400 });
    }

    // é membro do grupo?
    const { data: member } = await supabaseAdmin
        .from("group_members").select("group_id")
        .eq("group_id", groupId).eq("player_id", user.id).maybeSingle();
    if (!member) return NextResponse.json({ error: "Você não está nesse grupo" }, { status: 403 });

    // o jogo já começou? (a trava)
    const { data: matchData } = await supabaseAdmin
        .from("matches").select("kickoff").eq("id", matchId).maybeSingle();
    const match = matchData as { kickoff: string } | null;
    if (!match) return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    if (new Date(match.kickoff).getTime() <= Date.now()) {
        return NextResponse.json({ error: "Esse jogo já começou" }, { status: 403 });
    }

    // insere ou atualiza o palpite
    const { error } = await supabaseAdmin.from("predictions").upsert(
        {
            group_id: groupId,
            player_id: user.id,
            match_id: matchId,
            home_score: home,
            away_score: away,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "group_id,player_id,match_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}