import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function generateCode(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Favor fazer login" }, { status: 401 });

    const body = (await request.json()) as { name?: string };
    const name = (body.name ?? "").trim();
    if (name.length < 2) {
        return NextResponse.json({ error: "Nome é muito curto. Mín 2 caracteres." }, { status: 400 });
    }

    const { count } = await supabaseAdmin
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("player_id", user.id);
    if ((count ?? 0) >= 5) {
        return NextResponse.json({ error: "Limite de 5 bolões por pessoa atingido." }, { status: 400 });
    }

    const { data: group, error } = await supabaseAdmin
        .from("groups")
        .insert({ name, invite_code: generateCode(), owner_id: user.id })
        .select("id")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("group_members").insert({ group_id: group.id, player_id: user.id });

    return NextResponse.json({ id: group.id });
}
