export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-lg animate-pulse px-4 py-8">
            {/* back + título */}
            <div className="mb-4 h-4 w-28 rounded bg-slate-200" />
            <div className="mb-5 h-8 w-24 rounded-lg bg-slate-200" />

            {/* tabs abertos/encerrados */}
            <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
                <div className="h-8 flex-1 rounded-lg bg-slate-200" />
                <div className="h-8 flex-1 rounded-lg bg-slate-100" />
            </div>

            {/* cards de jogos */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="rounded-2xl bg-slate-200 p-4">
                        <div className="mb-3 h-3 w-32 rounded bg-slate-300" />
                        <div className="flex items-center justify-between gap-4">
                            <div className="h-5 w-24 rounded bg-slate-300" />
                            <div className="flex gap-2">
                                <div className="h-9 w-9 rounded-xl bg-slate-300" />
                                <div className="h-9 w-7 rounded bg-slate-300" />
                                <div className="h-9 w-9 rounded-xl bg-slate-300" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-4">
                            <div className="h-5 w-20 rounded bg-slate-300" />
                            <div className="flex gap-2">
                                <div className="h-9 w-9 rounded-xl bg-slate-300" />
                                <div className="h-9 w-7 rounded bg-slate-300" />
                                <div className="h-9 w-9 rounded-xl bg-slate-300" />
                            </div>
                        </div>
                        <div className="mt-2 h-9 rounded-xl bg-slate-300" />
                    </div>
                ))}
            </div>
        </div>
    );
}
