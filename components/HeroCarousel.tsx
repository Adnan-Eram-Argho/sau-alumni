"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type Slide = { id: string; image_url: string };

// Hero-r jaygay carousel — chobi thakle. Auto-slide,
// arrow, dot. Hover-e pause.
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const total = slides.length;

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % total);
    }, [total]);

    const prev = () => {
        setCurrent((c) => (c - 1 + total) % total);
    };

    // 5 sec auto-slide (pause-e thakle na)
    useEffect(() => {
        if (paused || total < 2) return;
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [paused, next, total]);

    return (
        <section
            className="relative overflow-hidden bg-sau text-white wave-divider"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            <div className="relative h-[60vh] min-h-80 w-full sm:h-[70vh]">
                {slides.map((s, i) => (
                    <div
                        key={s.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "pointer-events-none opacity-0"
                            }`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={s.image_url}
                            alt={`SAU Alumni ${i + 1}`}
                            className="h-full w-full object-cover"
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                        {/* Halka dark overlay — lekha porte subidha */}
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/25 to-transparent" />
                    </div>
                ))}

                {/* Center lekha — sob slide-r upore ek */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
                    <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium tracking-wide text-emerald-100 backdrop-blur-sm">
                        শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় · ঢাকা
                    </p>
                    <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-snug drop-shadow-lg sm:text-5xl sm:leading-tight">
                        এক ক্যাম্পাস, এক পরিবার —{" "}
                        <span className="text-amber-300">সারা পৃথিবীতে</span>
                    </h1>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/auth/signup"
                            className="btn-shimmer group flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 font-semibold text-emerald-950 shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300"
                        >
                            যোগ দিন — একদম ফ্রি
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/directory"
                            className="group flex items-center gap-2 rounded-xl border border-emerald-100/30 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:border-emerald-100/50 hover:bg-white/10"
                        >
                            ডিরেক্টরি দেখুন
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {/* Arrows (2+ slide hole) */}
                {total > 1 && (
                    <>
                        <button
                            onClick={prev}
                            aria-label="আগের ছবি"
                            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={next}
                            aria-label="পরের ছবি"
                            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    aria-label={`ছবি ${i + 1}`}
                                    className={`h-2 rounded-full transition-all ${i === current
                                            ? "w-7 bg-amber-400"
                                            : "w-2 bg-white/50 hover:bg-white/80"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}