import { supabaseAdmin } from "@/lib/supabase/admin";

const FONTE = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

type JogoCru = {
    round: string;
    num?: number;
    date: string;
    time: string;
    team1: string;
    team2: string;
    group?: string;
    score?: { ft?: [number, number] };
};

function buildDateTime(date: string, time: string): string {
    const match = time.match(/(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})/);

    if (!match) return `${date}T00:00:00-03:00`;

    const hour = match[1].padStart(2, "0");
    const timezone = Number(match[3]);

    const sign = timezone < 0 ? "-" : "+";
    const formattedTimezone = `${sign}${String(Math.abs(timezone)).padStart(2, "0")}:00`;

    return `${date}T${hour}:${match[2]}:00${formattedTimezone}`;
}

function buildExtId(j: JogoCru): string {
    if (typeof j.num === "number") return `M${j.num}`;
    return `G-${j.date}-${j.team1}-${j.team2}`.replace(/\s+/g, "_");
}

export async function importMatches(): Promise<number> {
    const response = await fetch(FONTE, { cache: "no-store" });
    const data = (await response.json()) as { matches: JogoCru[] };

    const rows = data.matches.map((m) => {
        const ft = m.score?.ft;
        const finished = Array.isArray(ft) && ft.length === 2;
        return {
            ext_id: buildExtId(m),
            round_label: m.round,
            group_label: m.group ?? null,
            team1: m.team1,
            team2: m.team2,
            kickoff: buildDateTime(m.date, m.time),
            home_score: finished ? ft[0] : null,
            away_score: finished ? ft[1] : null,
            status: finished ? "finished" : "scheduled",
        };
    });

    const { error } = await supabaseAdmin
        .from("matches")
        .upsert(rows, { onConflict: "ext_id" });

    if (error) throw new Error(error.message);
    return rows.length;
}