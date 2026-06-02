import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Favor fazer login" }, { status: 401 });
    }

    const body = (await request.json()) as { code?: string };
    const code = (body.code ?? "").trim().toUpperCase();

    const { data: group } = await supabaseAdmin
        .from("groups")
        .select("id, is_open")
        .eq("invite_code", code)
        .maybeSingle();

    if (!group) {
        return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
    }

    // already a member? then just return the id
    const { data: member } = await supabaseAdmin
        .from("group_members")
        .select("group_id")
        .eq("group_id", group.id)
        .eq("player_id", user.id)
        .maybeSingle();

    if (!member) {
        if (!group.is_open) {
            return NextResponse.json({ error: "O grupo está fechado." }, { status: 403 });
        }

        const { count } = await supabaseAdmin
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("player_id", user.id);
        if ((count ?? 0) >= 5) {
            return NextResponse.json({ error: "Limite de 5 bolões por pessoa atingido." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("group_members")
            .insert({ group_id: group.id, player_id: user.id });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ id: group.id });
}