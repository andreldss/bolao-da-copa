import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Faça login" }, { status: 401 });

    const body = (await request.json()) as { groupId?: string };
    const { data: grupo } = await supabaseAdmin
        .from("groups").select("owner_id, is_open").eq("id", body.groupId ?? "").maybeSingle();
    if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
    if (grupo.owner_id !== user.id)
        return NextResponse.json({ error: "Só o dono pode mudar" }, { status: 403 });

    const novo = !grupo.is_open;
    await supabaseAdmin.from("groups").update({ is_open: novo }).eq("id", body.groupId);
    return NextResponse.json({ is_open: novo });
}