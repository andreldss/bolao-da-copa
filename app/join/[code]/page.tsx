import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import LoginButton from "@/components/LoginButton";
import JoinButton from "@/components/JoinButton";
import Link from "next/link";

type Grupo = { id: string; name: string; is_open: boolean };

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const codeUpper = code.toUpperCase();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabaseAdmin
        .from("groups").select("id, name, is_open").eq("invite_code", codeUpper).maybeSingle();
    const grupo = data as Grupo | null;

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-6 text-center text-white">
            <span className="text-6xl drop-shadow-lg">⚽</span>

            {!grupo ? (
                <>
                    <p className="text-lg font-semibold">Convite inválido ou expirado.</p>
                    <Link href="/" className="text-sm text-white font-bold underline underline-offset-2 hover:text-white transition">
                        Voltar ao início
                    </Link>
                </>
            ) : !user ? (
                <>
                    <div>
                        <h1 className="text-2xl font-black">Bolão "{grupo.name}"</h1>
                        <p className="mt-1 text-emerald-200">Entre com o Google pra participar.</p>
                    </div>
                    <LoginButton next={`/join/${codeUpper}`} />
                </>
            ) : !grupo.is_open ? (
                <>
                    <p className="text-lg font-semibold">O bolão "{grupo.name}" está fechado.</p>
                    <Link href="/" className="text-sm text-white font-bold underline underline-offset-2 hover:text-white transition">
                        Voltar ao início
                    </Link>
                </>
            ) : (
                <>
                    <div>
                        <h1 className="text-2xl font-black">Bolão "{grupo.name}"</h1>
                        <p className="mt-1 text-emerald-200">Você foi convidado!</p>
                    </div>
                    <JoinButton code={codeUpper} />
                    <Link href="/" className="text-sm text-white font-bold underline underline-offset-2 hover:text-white transition">
                        Voltar ao início
                    </Link>
                </>
            )}
        </main>
    );
}
