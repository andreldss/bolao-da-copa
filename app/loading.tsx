export default function Loading() {
    return (
        <div className="min-h-dvh animate-pulse">
            {/* mesma estrutura e espaçamentos do header real */}
            <div className="bg-gradient-to-b from-emerald-700 to-emerald-900 px-4 pb-8 pt-6">
                {/* linha do título + logout */}
                <div className="mx-auto flex w-full max-w-lg items-center justify-between">
                    <div className="h-7 w-40 rounded bg-emerald-600/50" />
                    <div className="h-4 w-8 rounded bg-emerald-600/50" />
                </div>

                {/* saudação */}
                <div className="mx-auto mt-7 w-full max-w-lg space-y-2">
                    <div className="h-3.5 w-8 rounded bg-emerald-600/50" />
                    <div className="h-9 w-44 rounded-lg bg-emerald-600/50" />
                </div>

                {/* card criar / entrar — mesma estrutura do real */}
                <div className="mx-auto mt-6 w-full max-w-lg">
                    <div className="space-y-4 rounded-2xl bg-white p-5 pb-7 shadow-lg">
                        <div>
                            <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
                            <div className="flex gap-2">
                                <div className="h-11 flex-1 rounded-xl bg-slate-200" />
                                <div className="h-11 w-16 rounded-xl bg-slate-200" />
                            </div>
                        </div>
                        <hr className="border-slate-100" />
                        <div>
                            <div className="mb-3 h-3 w-28 rounded bg-slate-200" />
                            <div className="flex gap-2">
                                <div className="h-11 flex-1 rounded-xl bg-slate-200" />
                                <div className="h-11 w-16 rounded-xl bg-slate-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* lista de bolões */}
            <div className="mx-auto w-full max-w-lg px-4 pt-8">
                <div className="mb-3 h-3 w-20 rounded bg-slate-200" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-32 rounded bg-slate-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
