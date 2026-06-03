import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Bolão da Copa",
        short_name: "Bolão",
        description: "Bolão da Copa do Mundo entre amigos: palpite, pontue e suba no ranking.",
        start_url: "/",
        display: "standalone",
        background_color: "#022c22",
        theme_color: "#022c22",
        orientation: "portrait",
        icons: [
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
