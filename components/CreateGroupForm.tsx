"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function criar() {
        setSaving(true);
        setError(null);
        const res = await fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) return setError(data.error);
        router.push(`/groups/${data.id}`);
    }

    return (
        <div>
            <div className="flex gap-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="nome do bolão"
                    className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                />
                <button
                    onClick={criar}
                    disabled={saving || name.trim().length < 2}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                    {saving ? "..." : "Criar"}
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
