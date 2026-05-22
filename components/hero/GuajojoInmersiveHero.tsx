"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface MicroActivity {
  icon: string;
  label: string;
  duration: string;
}

const MICRO_ACTIVITIES: MicroActivity[] = [
  { icon: "🏔️", label: "Trekking Samaipata", duration: "2 días" },
  { icon: "🌿", label: "Amboró Cloud Forest", duration: "1 día" },
  { icon: "🦅", label: "Rapelling Waterfalls", duration: "Medio día" },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Splits text into individual <span> elements for word-level stagger.
 * Each word is wrapped in an overflow-hidden container so the reveal
 * looks like the text pushes up through a mask.
 */
function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="word-mask inline-block overflow-hidden leading-[1.1]"
          aria-hidden="true"
        >
          <span
            className="word-inner inline-block"
            style={{ opacity: 0, transform: "translateY(40px)" }}
          >
            {word}
          </span>
          {i < text.split(" ").length - 1 && " "}
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function GuajojoInmersiveHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const microBuilderRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !imageCardRef.current ||
        !imageInnerRef.current ||
        !manifestoRef.current ||
        !microBuilderRef.current ||
        !ctaRef.current ||
        !overlayRef.current
      )
        return;

      // ── Master timeline scrubbed to scroll ──────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // ── Phase 1: Image card expands to full viewport ─────────────────
      // Start values are set inline on the element (see JSX below).
      // We animate to full-screen via scale + clip-path (GPU only).
      tl.to(
        imageCardRef.current,
        {
          width: "100vw",
          height: "100vh",
          borderRadius: 0,
          ease: "power2.inOut",
          duration: 1,
        },
        0,
      )
        // Subtle counter-scale on the inner image so it looks parallax
        .to(
          imageInnerRef.current,
          {
            scale: 1.12,
            ease: "power2.inOut",
            duration: 1,
          },
          0,
        )
        // Darken overlay so text pops over the expanded image
        .to(
          overlayRef.current,
          {
            opacity: 0.55,
            ease: "power2.inOut",
            duration: 0.6,
          },
          0.4,
        );

      // ── Phase 2: Manifesto text reveals word by word ─────────────────
      const wordInners = gsap.utils.toArray<HTMLElement>(
        manifestoRef.current.querySelectorAll(".word-inner"),
      );

      tl.set(manifestoRef.current, { autoAlpha: 1 }, 0.7).to(
        wordInners,
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power3.out",
          duration: 0.6,
          onComplete: () => {
            const masks = manifestoRef.current?.querySelectorAll(".word-mask");
            masks?.forEach((mask) => {
              (mask as HTMLElement).style.overflow = "visible";
            });
          },
        },
        0.8,
      );

      // ── Phase 3: Micro-builder slides up, then CTA blooms ────────────
      tl.fromTo(
        microBuilderRef.current,
        { autoAlpha: 0, y: 60, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power3.out",
          duration: 0.7,
        },
        1.8,
      ).fromTo(
        ctaRef.current,
        { autoAlpha: 0, scale: 0.88, filter: "blur(6px)" },
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          ease: "back.out(1.4)",
          duration: 0.6,
        },
        2.3,
      );

      // Slight parallax push on the manifesto during phase 3 scroll
      tl.to(
        manifestoRef.current,
        {
          y: -32,
          ease: "none",
          duration: 0.6,
        },
        1.7,
      );

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="guajojo-pin-section"
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "#020c06" }}
      aria-label="Guajojó Tours — Diseña tu ruta en Bolivia"
    >
      {/* ── Phase 1: Cinematic image card ─────────────────────────── */}
      <div
        ref={imageCardRef}
        className="absolute overflow-hidden will-change-transform"
        style={{
          width: "52vw",
          height: "62vh",
          borderRadius: "20px",
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
        }}
      >
        {/* Inner image (GPU counter-scale) */}
        <div
          ref={imageInnerRef}
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{
            background: `url('/images/activities/Fuerte-de-Samaipata.png') center / cover no-repeat`,
          }}
        />

        {/* Dark overlay that intensifies on phase 1 completion */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(2,12,6,0.85) 0%, rgba(2,12,6,0.1) 60%, transparent 100%)",
            opacity: 0.2,
          }}
        />

        {/* Small label that fades with the card */}
        <div
          className="absolute bottom-5 left-5 section-label"
          style={{
            color: "rgba(52,211,153,0.7)",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
          }}
        >
          Bolivia · Samaipata · El Fuerte UNESCO
        </div>
      </div>

      {/* ── Phase 2: Manifesto ────────────────────────────────────── */}
      <div
        ref={manifestoRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{ opacity: 0, zIndex: 10 }}
        aria-live="polite"
      >
        {/* Eyebrow */}
        <p
          className="section-label mb-5"
          style={{ opacity: 0, transform: "translateY(20px)" }}
          aria-hidden="true"
        >
          <span className="word-mask inline-block overflow-hidden">
            <span
              className="word-inner inline-block"
              style={{ opacity: 0, transform: "translateY(40px)" }}
            >
              Turismo
            </span>
          </span>{" "}
          <span className="word-mask inline-block overflow-hidden">
            <span
              className="word-inner inline-block"
              style={{ opacity: 0, transform: "translateY(40px)" }}
            >
              de Autor
            </span>
          </span>
        </p>

        {/* Primary headline */}
        <h2
          className="font-display text-center mb-4"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 5rem)",
            lineHeight: 1.05,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            maxWidth: "800px",
          }}
        >
          <SplitWords text="Tu viaje no debería" />
          <br />
          <SplitWords text="ser una plantilla." className="italic" />
        </h2>

        {/* Sub-headline */}
        <p
          className="mt-3"
          style={{
            fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
            color: "var(--accent-emerald)",
            fontFamily: "var(--font-playfair)",
            fontWeight: 400,
            fontStyle: "italic",
            letterSpacing: "0.02em",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.7), 0 0 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <SplitWords text="Arma tu propia ruta." />
        </p>
      </div>

      {/* ── Phase 3: Micro-builder preview + CTA ─────────────────── */}
      <div
        ref={microBuilderRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5"
        style={{
          opacity: 0,
          zIndex: 20,
          minWidth: "320px",
          maxWidth: "480px",
          width: "90vw",
        }}
      >
        {/* Micro-constructor card */}
        <div
          className="liquid-glass w-full rounded-2xl p-5"
          style={{ border: "1px solid rgba(52,211,153,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="section-label" style={{ fontSize: "0.6rem" }}>
              Constructor de Ruta
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(52,211,153,0.12)",
                color: "var(--accent-emerald)",
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              3 días · Editable
            </span>
          </div>

          {/* Activity preview chips */}
          <ul
            className="flex flex-col gap-2"
            aria-label="Actividades seleccionadas"
          >
            {MICRO_ACTIVITIES.map((activity, i) => (
              <li
                key={activity.label}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <span className="text-lg" aria-hidden="true">
                  {activity.icon}
                </span>
                <span
                  className="flex-1 text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activity.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {activity.duration}
                </span>
                {/* Drag handle hint */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  style={{ opacity: 0.3, flexShrink: 0 }}
                >
                  <circle cx="4" cy="3" r="1" fill="currentColor" />
                  <circle cx="8" cy="3" r="1" fill="currentColor" />
                  <circle cx="4" cy="6" r="1" fill="currentColor" />
                  <circle cx="8" cy="6" r="1" fill="currentColor" />
                  <circle cx="4" cy="9" r="1" fill="currentColor" />
                  <circle cx="8" cy="9" r="1" fill="currentColor" />
                </svg>
              </li>
            ))}
          </ul>

          {/* Add-more hint */}
          <div
            className="mt-3 flex items-center gap-2 text-xs"
            style={{ color: "rgba(52,211,153,0.5)" }}
          >
            <span aria-hidden="true">＋</span>
            <span>Arrastrá más actividades · 40+ disponibles</span>
          </div>
        </div>

        {/* CTA button */}
        <button
          ref={ctaRef}
          type="button"
          className="w-full py-4 px-8 rounded-2xl font-medium text-base tracking-wide transition-all duration-300"
          style={{
            opacity: 0,
            background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
            color: "#020c06",
            boxShadow:
              "0 0 40px rgba(52,211,153,0.35), 0 8px 24px rgba(0,0,0,0.4)",
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1.03,
              boxShadow:
                "0 0 60px rgba(52,211,153,0.55), 0 12px 32px rgba(0,0,0,0.5)",
              duration: 0.3,
              ease: "power2.out",
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1,
              boxShadow:
                "0 0 40px rgba(52,211,153,0.35), 0 8px 24px rgba(0,0,0,0.4)",
              duration: 0.3,
              ease: "power2.out",
            });
          }}
          onClick={() => {
            document
              .getElementById("constructor")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          aria-label="Ir al constructor de rutas Guajojó"
        >
          Diseñar mi Ruta Guajojó
        </button>

        {/* Micro copy below CTA */}
        <p
          className="text-xs text-center"
          style={{
            color: "rgba(255,255,255,0.25)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Sin formularios · Sin paquetes fijos · 100% tuyo
        </p>
      </div>
    </section>
  );
}
