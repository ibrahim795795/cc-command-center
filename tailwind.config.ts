import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#E8E4DD", // Paper
                accent: "#E63B2E",  // Signal Red
                dark: "#111111",    // Black
                surface: "#F5F3EE", // Off-white
            },
            fontFamily: {
                sans: ["Space Grotesk", "sans-serif"],
                serif: ["DM Serif Display", "serif"],
                mono: ["Space Mono", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;
