export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
}