import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import CreateGroupForm from "@/components/CreateGroupForm";
import JoinByCode from "@/components/JoinByCode";
import Link from "next/link";

type Group = { id: string; name: string; is_open: boolean };

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-emerald-950 px-6 text-center text-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="relative flex flex-col items-center gap-7">
          <span className="text-7xl drop-shadow-xl">⚽</span>
          <div>
            <h1 className="font-display text-5xl uppercase leading-none tracking-tight">
              Bolão <span className="text-amber-400">da Copa</span>
            </h1>
          </div>
          <LoginButton />
        </div>
      </main>
    );
  }

  const fullName = (user.user_metadata.full_name as string | undefined) ?? user.email ?? "Jogador";
  const firstName = fullName.split(" ")[0];

  const { data } = await supabaseAdmin
    .from("group_members")
    .select("groups(id, name, is_open)")
    .eq("player_id", user.id)
    .returns<{ groups: Group }[]>();

  const groups = (data ?? []).map((row) => row.groups);
  const atLimit = groups.length >= 5;

  return (
    <div className="min-h-dvh">
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-900 px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between text-white">
          <span className="font-display text-xl uppercase tracking-tight">
            ⚽ Bolão da Copa
          </span>
          <LogoutButton />
        </div>

        <div className="mx-auto mt-7 w-full max-w-lg text-white">
          <p className="text-sm text-emerald-200">Olá,</p>
          <h1 className="font-display text-2xl uppercase leading-tight">
            {firstName} 👋
          </h1>
        </div>

        <div className="mx-auto mt-6 w-full max-w-lg">
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5">
            {atLimit ? (
              <p className="text-center text-sm text-amber-700">
                Você atingiu o limite de 5 bolões. Saia de um para criar outro.
              </p>
            ) : (
              <div>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Criar um bolão
                </h2>
                <CreateGroupForm />
              </div>
            )}

            <hr className="border-slate-100" />

            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Entrar por código
              </h2>
              <JoinByCode />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-8">
        <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Seus bolões</h2>

        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
              <span className="text-3xl">🏟️</span>
              <p className="mt-2 text-sm text-slate-500">
                Você ainda não está em nenhum bolão. Crie um aí em cima, ou abra o link de convite que te mandaram.
              </p>
            </div>
          ) : (
            groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg font-black text-emerald-700">
                  {g.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{g.name}</p>
                </div>
                <span className="text-xl text-slate-300">›</span>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}