"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash } from "lucide-react";

type Props = { groupId: string; isOpen: boolean };

export default function GroupOwnerMenu({ groupId, isOpen }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [busy, setBusy] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirmDelete(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function toggle() {
        setBusy(true);
        await fetch("/api/groups/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId }),
        });
        setBusy(false);
        setOpen(false);
        router.refresh();
    }

    async function deleteGroup() {
        setBusy(true);
        await fetch("/api/groups/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId }),
        });
        setBusy(false);
        router.push("/");
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => { setOpen((v) => !v); setConfirmDelete(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:opacity-75 cursor-pointer"
            >
                <MoreHorizontal size={20} />
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
                    <button
                        onClick={toggle}
                        disabled={busy}
                        className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:opacity-75 disabled:opacity-40 cursor-pointer"
                    >
                        {isOpen ? "Fechar grupo" : "Reabrir grupo"}
                    </button>

                    <div className="mx-4 border-t border-slate-100" />

                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 active:opacity-75 cursor-pointer"
                        >
                            <Trash size={14} /> Apagar bolão
                        </button>
                    ) : (
                        <div className="px-4 py-3">
                            <p className="mb-2 text-xs font-semibold text-slate-500">Apagar de verdade?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={deleteGroup}
                                    disabled={busy}
                                    className="flex-1 rounded-lg bg-red-500 py-1.5 text-sm font-bold text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-40 cursor-pointer"
                                >
                                    {busy ? "…" : "Apagar"}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 rounded-lg bg-slate-100 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200 active:opacity-75 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
