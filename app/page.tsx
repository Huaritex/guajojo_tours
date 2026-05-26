import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import GuajojoInmersiveHero from "@/components/hero/GuajojoInmersiveHero";
import ScrollTransition from "@/components/scroll-transition/ScrollTransition";
import GuajojoActivityGrid from "@/components/activities/GuajojoActivityGrid";
import WorkspaceLayout from "@/components/constructor/WorkspaceLayout";
import FAQAccordion from "@/components/ui/FAQAccordion";
import TripHydrator from "@/components/ui/TripHydrator";

export default function HomePage() {
  return (
    <main>
      <TripHydrator />
      <Navbar />
      <HeroSection />
      <GuajojoInmersiveHero />1
      <ScrollTransition />
      <GuajojoActivityGrid />
      <WorkspaceLayout />
      <FAQAccordion />
      <footer
        id="contacto"
        className="py-16 px-6 text-center"
        style={{
          background: "#030f08",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p
          className="font-display text-2xl mb-2"
          style={{ color: "var(--accent-gold)" }}
        >
          Guajojó Tours
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Samaipata, Santa Cruz, Bolivia · info@guajojotours.bo
        </p>
        <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} Guajojó Tours. Todos los derechos
          reservados.
        </p>
      </footer>
    </main>
  );
}
