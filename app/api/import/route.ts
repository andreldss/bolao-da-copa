import { NextResponse } from "next/server";
import { importMatches } from "@/lib/fixtures"; // ou o nome que você deu

export async function GET(request: Request) {
    const auth = request.headers.get("authorization");
    const isCron = auth === `Bearer ${process.env.CRON_SECRET}`;
    if (process.env.NODE_ENV === "production" && !isCron) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const total = await importMatches();
        return NextResponse.json({ ok: true, total });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "erro";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}