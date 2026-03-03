"use client";

import { Check } from "lucide-react";

export function Pricing() {
    return (
        <section id="pricing" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="mb-16">
                <h2 className="text-5xl md:text-7xl font-sans font-bold text-dark tracking-tight mb-4">System Access</h2>
                <p className="text-dark/60 font-mono text-sm max-w-xl">Procure the right level of telemetry for your financial stack.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Starter */}
                <div className="flex flex-col border border-dark/20 p-8 bg-surface">
                    <h3 className="font-sans font-bold text-2xl mb-2 text-dark">Starter</h3>
                    <div className="font-mono text-3xl mb-6 text-dark tracking-tighter">Free</div>
                    <p className="font-sans text-dark/70 mb-8 text-sm">Essential monitoring for a contained wallet ecosystem.</p>

                    <ul className="font-mono text-xs text-dark/80 space-y-4 mb-12 flex-1">
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> Up to 3 active cards</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> Up to 5 closed/non-active cards</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> Standard dashboard clarity</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> Basic deadline reminders</li>
                    </ul>

                    <a href="/dashboard" className="w-full block text-center border-2 border-dark text-dark font-sans font-bold py-3 hover:bg-dark hover:text-white transition-colors">
                        Initialize Free
                    </a>
                </div>

                {/* Standard */}
                <div className="flex flex-col border-2 border-dark p-8 bg-dark relative transform md:-translate-y-4 shadow-2xl">
                    <div className="absolute top-0 right-0 bg-accent text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                        Optimal
                    </div>
                    <h3 className="font-sans font-bold text-2xl mb-2 text-white">Standard</h3>
                    <div className="font-mono text-3xl mb-6 text-white tracking-tighter">$2.95<span className="text-sm text-white/50">/mo</span></div>
                    <p className="font-sans text-white/70 mb-8 text-sm">Advanced telemetry for the active optimizer.</p>

                    <ul className="font-mono text-xs text-white space-y-4 mb-12 flex-1">
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0" /> Up to 10 active cards</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0" /> Unlimited closed cards archives</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0" /> Advanced Multi-factor Security</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0" /> Retention offer tracking suite</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-accent shrink-0" /> Document & proof attachment hub</li>
                    </ul>

                    <a href="/dashboard" className="w-full block text-center bg-accent text-white font-sans font-bold py-3 hover:opacity-90 transition-opacity">
                        Procure License
                    </a>
                </div>

                {/* Elite */}
                <div className="flex flex-col border border-dark/20 p-8 bg-surface">
                    <h3 className="font-sans font-bold text-2xl mb-2 text-dark">Elite</h3>
                    <div className="font-mono text-3xl mb-6 text-dark tracking-tighter">$9.95<span className="text-sm text-dark/50">/mo</span></div>
                    <p className="font-sans text-dark/70 mb-8 text-sm">Unrestricted access for total ecosystem domination.</p>

                    <ul className="font-mono text-xs text-dark/80 space-y-4 mb-12 flex-1">
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> Unlimited active cards</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> Player-two (P2) multi-tenant mapping</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> 1-on-1 PDF importing concierge</li>
                        <li className="flex items-start gap-3"><Check className="w-4 h-4 text-dark shrink-0" /> API Access for custom scraping</li>
                    </ul>

                    <a href="/dashboard" className="w-full block text-center border-2 border-dark text-dark font-sans font-bold py-3 hover:bg-dark hover:text-white transition-colors">
                        Upgrade to Elite
                    </a>
                </div>
            </div>
        </section>
    );
}
