import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Faça login" }, { status: 401 });

    const body = (await request.json()) as { groupId?: string };
    if (!body.groupId) return NextResponse.json({ error: "groupId obrigatório" }, { status: 400 });

    const { data: group } = await supabaseAdmin
        .from("groups").select("owner_id").eq("id", body.groupId).maybeSingle();
    if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
    if (group.owner_id !== user.id) return NextResponse.json({ error: "Apenas o dono pode apagar" }, { status: 403 });

    // delete in order: predictions → members → group
    await supabaseAdmin.from("predictions").delete().eq("group_id", body.groupId);
    await supabaseAdmin.from("group_members").delete().eq("group_id", body.groupId);
    const { error } = await supabaseAdmin.from("groups").delete().eq("id", body.groupId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
