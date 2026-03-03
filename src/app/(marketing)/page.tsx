"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Check } from "lucide-react";
import { DiagnosticShuffler, TelemetryTypewriter, CursorProtocolScheduler } from "@/components/landing/Features";
import { Philosophy } from "@/components/landing/Philosophy";
import { Pricing } from "@/components/landing/Pricing";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Hero Animations
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.from(".hero-text span", {
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 1.2,
                delay: 0.2
            })
                .from(".hero-subtext", { y: 20, opacity: 0, duration: 1 }, "-=0.8")
                .from(".hero-btn", { y: 20, opacity: 0, duration: 1 }, "-=0.8");

            // Features Stagger
            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: "#features",
                    start: "top 70%",
                },
                y: 50,
                opacity: 0,
                stagger: 0.15,
                duration: 1,
                ease: "power3.out"
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-screen bg-background">

            {/* Global CSS Noise Overlay */}
            <svg className="pointer-events-none fixed inset-0 z-[100] h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>

            {/* Floating Island Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-dark/10 bg-surface/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between gap-12 shadow-sm transition-all duration-300">
                <div className="font-bold tracking-tight text-xl font-sans">WalletOS</div>
                <div className="hidden md:flex gap-8 text-sm font-mono font-bold text-dark/70">
                    <a href="#features" className="hover:-translate-y-[1px] hover:text-accent transition-all">Features</a>
                    <a href="#protocol" className="hover:-translate-y-[1px] hover:text-accent transition-all">Protocol</a>
                    <a href="/dashboard" className="text-dark hover:-translate-y-[1px] hover:text-accent transition-all">Dashboard</a>
                </div>
            </nav>

            {/* A. HERO SECTION */}
            <section className="relative h-[100dvh] pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center items-center bg-black overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2940&auto=format&fit=crop"
                        alt="Subtle dark financial aesthetic"
                        className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
                    />
                </div>

                <div className="relative z-20 max-w-5xl text-white flex flex-col items-center text-center mx-auto mt-24">
                    <h1 className="hero-text opacity-1 flex flex-col gap-0 md:gap-2">
                        <span className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-white mb-2">Meet WalletOS</span>
                    </h1>
                    <p className="hero-subtext mt-4 text-primary/80 max-w-xl text-lg md:text-xl font-sans leading-relaxed">
                        WalletOS is your centralized control room for tracking every credit card, points balance, churn deadline, renewal, and document in one clean dashboard.
                    </p>
                    <div className="hero-btn mt-12">
                        <a href="/dashboard" className="group inline-flex relative overflow-hidden rounded-[2rem] bg-accent px-8 py-4 text-white font-sans font-bold items-center gap-2 hover:scale-[1.03] transition-transform duration-300">
                            <span className="relative z-10">Add my card</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            {/* C. FEATURES */}
            <section id="features" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">

                    <div className="feature-card flex flex-col bg-surface border-t-4 border-dark/10 p-8 shadow-sm transition-colors hover:bg-white">
                        <h3 className="font-sans font-bold text-2xl mb-4 text-dark tracking-tight">One-screen clarity</h3>
                        <p className="font-mono text-xs text-dark/60 mb-12 uppercase tracking-wide leading-relaxed">A true birds-eye dashboard for all cards, points, renewals, fees, and deadlines so nothing slips.</p>
                        <div className="mt-auto">
                            <DiagnosticShuffler />
                        </div>
                    </div>

                    <div className="feature-card flex flex-col bg-surface border-t-4 border-dark/10 p-8 shadow-sm transition-colors hover:bg-white">
                        <h3 className="font-sans font-bold text-2xl mb-4 text-dark tracking-tight">Fee & retention control</h3>
                        <p className="font-mono text-xs text-dark/60 mb-12 uppercase tracking-wide leading-relaxed">Track waived fees, negotiated savings, and upcoming annual fees with clear status and reminders.</p>
                        <div className="mt-auto">
                            <TelemetryTypewriter />
                        </div>
                    </div>

                    <div className="feature-card flex flex-col bg-surface border-t-4 border-dark/10 p-8 shadow-sm transition-colors hover:bg-white">
                        <h3 className="font-sans font-bold text-2xl mb-4 text-dark tracking-tight">Document hub per card</h3>
                        <p className="font-mono text-xs text-dark/60 mb-12 uppercase tracking-wide leading-relaxed">Store statements and retention proof directly on each card so everything is instantly searchable.</p>
                        <div className="mt-auto">
                            <CursorProtocolScheduler />
                        </div>
                    </div>

                </div>
            </section>

            {/* D. PHILOSOPHY */}
            <Philosophy />

            {/* E. PRICING */}
            <div id="pricing">
                <Pricing />
            </div>

            {/* F. GET STARTED & G. FOOTER */}
            <footer className="bg-dark text-white rounded-t-[4rem] px-6 md:px-12 py-24 mt-[-4rem] relative z-50 overflow-hidden">

                {/* Get Started Mini-section inside footer top */}
                <div className="max-w-4xl mx-auto text-center border-b border-white/10 pb-24 mb-24">
                    <h2 className="text-5xl md:text-7xl font-sans font-bold mb-6">Initialize WalletOS</h2>
                    <p className="text-xl text-white/50 font-sans mb-12 max-w-xl mx-auto">Stop managing your digital assets across five spreadhsheets and two apps. Upgrade to the command center today.</p>
                    <a href="/dashboard" className="group inline-flex relative overflow-hidden rounded-[2rem] bg-accent px-12 py-5 text-white font-sans text-lg font-bold items-center justify-center gap-3 hover:scale-[1.03] transition-all duration-300">
                        <span className="relative z-10">Deploy Command Center</span>
                        <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Footer Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="font-bold tracking-tight text-3xl font-sans mb-4">WalletOS</div>
                        <p className="text-white/50 font-mono text-sm max-w-xs leading-relaxed">The high-fidelity personal command center for your entire credit hardware and reward software ecosystem.</p>

                        {/* System Operational Indicator */}
                        <div className="inline-flex items-center gap-3 mt-12 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                            <span className="font-mono text-xs tracking-widest uppercase text-white/70">System Operational</span>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold font-sans text-white mb-6 uppercase tracking-wider text-sm">Navigation</h4>
                        <ul className="space-y-4 font-mono text-sm text-white/50">
                            <li><a href="#features" className="hover:text-accent transition-colors">Features</a></li>
                            <li><a href="#protocol" className="hover:text-accent transition-colors">Protocol</a></li>
                            <li><a href="/dashboard" className="hover:text-accent transition-colors">Terminal Dashboard</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold font-sans text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
                        <ul className="space-y-4 font-mono text-sm text-white/50">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </footer>

        </div>
    );
}
