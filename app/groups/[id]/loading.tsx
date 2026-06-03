export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-lg animate-pulse px-4 py-8">
            {/* back + menu */}
            <div className="mb-6 flex items-center justify-between">
                <div className="h-4 w-14 rounded bg-slate-200" />
                <div className="h-8 w-8 rounded-xl bg-slate-200" />
            </div>

            {/* código + nome */}
            <div className="mb-1 h-3 w-16 rounded bg-slate-200" />
            <div className="mb-5 h-10 w-56 rounded-lg bg-slate-200" />

            {/* invite link */}
            <div className="h-20 rounded-2xl bg-slate-200" />

            {/* botão palpitar */}
            <div className="mt-4 h-12 rounded-xl bg-slate-200" />

            {/* tabs */}
            <div className="mt-6 h-10 rounded-xl bg-slate-200" />

            {/* lista ranking/participantes */}
            <div className="mt-4 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-200 p-4">
                        <div className="h-5 w-5 rounded-full bg-slate-300" />
                        <div className="h-4 flex-1 rounded bg-slate-300" />
                        <div className="h-4 w-12 rounded bg-slate-300" />
                    </div>
                ))}
            </div>
        </div>
    );
}
