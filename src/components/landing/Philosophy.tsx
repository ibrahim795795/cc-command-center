"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Philosophy() {
    const sectionRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLImageElement>(null);
    const line1Ref = useRef<HTMLDivElement>(null);
    const line2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Parallax Background
            gsap.to(bgRef.current, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });

            // Text Reveal
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                }
            });

            tl.fromTo(line1Ref.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            ).fromTo(line2Ref.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
                "-=0.6"
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full py-48 bg-dark overflow-hidden flex items-center">
            {/* Texture Background */}
            <img
                ref={bgRef}
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2940&auto=format&fit=crop"
                alt="Luxe Travel Aviation"
                className="absolute inset-0 w-full h-[120%] object-cover opacity-[0.15] -top-[10%] mix-blend-luminosity"
            />

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 w-full">
                <div ref={line1Ref} className="text-white/60 font-mono text-xl md:text-2xl tracking-tight mb-8">
                    Most personal finance tools focus on: <span className="text-white">fragmented spending tracking.</span>
                </div>
                <div ref={line2Ref} className="text-5xl md:text-8xl font-serif italic text-white leading-[0.9]">
                    We focus on:<br />
                    <span className="text-accent">total ecosystem command.</span>
                </div>
            </div>
        </section>
    );
}
