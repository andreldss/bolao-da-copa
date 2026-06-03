"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";

type Props = { groupId: string; groupName: string; isOpen: boolean };

export default function GroupOwnerMenu({ groupId, groupName, isOpen }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(groupName);
    const [busy, setBusy] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirmDelete(false);
                setRenaming(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (renaming) inputRef.current?.focus();
    }, [renaming]);

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

    async function rename() {
        const name = newName.trim();
        if (name.length < 2 || name === groupName) { setRenaming(false); return; }
        setBusy(true);
        await fetch("/api/groups/rename", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId, name }),
        });
        setBusy(false);
        setRenaming(false);
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

    function openMenu() {
        setOpen((v) => !v);
        setConfirmDelete(false);
        setRenaming(false);
        setNewName(groupName);
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={openMenu}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:opacity-75"
            >
                <MoreHorizontal size={20} />
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
                    {/* toggle aberto/fechado */}
                    <button
                        onClick={toggle}
                        disabled={busy}
                        className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:opacity-75 disabled:opacity-40 cursor-pointer"
                    >
                        {isOpen ? "Fechar grupo" : "Reabrir grupo"}
                    </button>

                    <div className="mx-4 border-t border-slate-100" />

                    {/* renomear */}
                    {!renaming ? (
                        <button
                            onClick={() => setRenaming(true)}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:opacity-75 cursor-pointer"
                        >
                            <Pencil size={14} /> Renomear bolão
                        </button>
                    ) : (
                        <div className="px-4 py-3">
                            <input
                                ref={inputRef}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") rename();
                                    if (e.key === "Escape") setRenaming(false);
                                }}
                                className="w-full rounded-lg border-2 border-emerald-400 px-3 py-1.5 text-sm outline-none"
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={rename}
                                    disabled={busy || newName.trim().length < 2}
                                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                                >
                                    {busy ? "…" : "Salvar"}
                                </button>
                                <button
                                    onClick={() => setRenaming(false)}
                                    className="flex-1 rounded-lg bg-slate-100 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200 active:opacity-75 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mx-4 border-t border-slate-100" />

                    {/* apagar */}
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
