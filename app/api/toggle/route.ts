import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Favor fazer login" }, { status: 401 });
    }

    const body = (await request.json()) as { groupId?: string };

    const { data: group } = await supabaseAdmin
        .from("groups")
        .select("owner_id, is_open")
        .eq("id", body.groupId ?? "")
        .maybeSingle();

    if (!group) {
        return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
    }

    if (group.owner_id !== user.id) {
        return NextResponse.json(
            { error: "Apenas o dono do grupo pode alterar." },
            { status: 403 }
        );
    }

    const newStatus = !group.is_open;

    await supabaseAdmin
        .from("groups")
        .update({ is_open: newStatus })
        .eq("id", body.groupId);

    return NextResponse.json({ is_open: newStatus });
}