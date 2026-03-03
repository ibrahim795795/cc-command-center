"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function DiagnosticShuffler() {
    return (
        <div className="h-48 w-full flex flex-col justify-end">
            <div className="w-full bg-dark text-white p-4 font-mono text-xs shadow-inner">
                <div className="flex justify-between border-b border-white/20 pb-2 mb-2">
                    <span className="text-white/50">AMEX PLAT</span>
                    <span>$699.00</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2 mb-2">
                    <span className="text-white/50">CHASE SAPPHIRE</span>
                    <span>$95.00</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2 mb-2">
                    <span className="text-white/50">CAPITAL ONE VENTURE X</span>
                    <span>$395.00</span>
                </div>
                <div className="flex justify-between pt-1">
                    <span className="text-accent font-bold">TOTAL EXPOSURE</span>
                    <span className="text-accent font-bold">$1,189.00</span>
                </div>
            </div>
        </div>
    );
}

export function TelemetryTypewriter() {
    return (
        <div className="h-48 w-full flex flex-col justify-end">
            <div className="w-full border border-dark/20 p-4 font-mono text-xs bg-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-dark tracking-widest text-[10px] uppercase font-bold">Retentive Action Required</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-dark/70">
                        <span>AEROPLAN RESERVE</span>
                        <span className="bg-dark/5 px-2 py-1">DUE IN 14 DAYS</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-dark/10">
                            <div className="h-full bg-accent w-[85%]" />
                        </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-dark/50">Recommended Action: Call for Retention Offer (Target: 15k MR)</div>
                </div>
            </div>
        </div>
    );
}

export function CursorProtocolScheduler() {
    return (
        <div className="h-48 w-full flex flex-col justify-end">
            <div className="w-full border border-dark/20 p-4 font-mono text-xs bg-white">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-dark font-bold">AEROPLAN_STATEMENT_OCT.PDF</span>
                    <span className="text-dark/40">1.2 MB</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-dark font-bold">AMEX_RETENTION_CHAT.PNG</span>
                    <span className="text-dark/40">840 KB</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-dark font-bold">CHASE_BENEFITS_GUIDE.PDF</span>
                    <span className="text-dark/40">3.1 MB</span>
                </div>
                <div className="mt-4 pt-3 border-t border-dark/10 flex justify-end">
                    <div className="bg-dark text-white px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                        Archive Secured
                    </div>
                </div>
            </div>
        </div>
    );
}
