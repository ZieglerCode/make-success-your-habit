import type {Metadata} from "next";
import {MarketingOfferPage, resolveBackHref} from "@/components/marketing-offer-page";

export const metadata: Metadata = {
  title: "ISOBL | Make Success Your Habit",
  description:
    "Instant Success Online Business Launch: ein digitales Zusatzgeschäft, das zu deinem bestehenden Business passt.",
};

export default async function IsoblPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = await resolveBackHref(searchParams, "/#angebote");

  return (
    <MarketingOfferPage
      eyebrow="Instant Success Online Business Launch"
      title="Ein digitales Zusatzgeschäft, das zu deinem Business passt."
      intro="ISOBL hilft Unternehmerinnen und Unternehmern, ihr bestehendes Business modern zu erweitern: mit passendem Online-Shop, Produkten, automatisierten Prozessen und klarer Begleitung."
      backHref={backHref}
      audienceTitle="Für bestehende Businesses, die digital wachsen wollen, ohne alles neu zu erfinden."
      audienceItems={[
        "Du arbeitest in Health, Beauty, Fitness, Coaching, Wellness, Healing, Dienstleistung oder Beratung.",
        "Du möchtest dein bestehendes Business digital erweitern, ohne eigene Produkte, Lager oder Versandstress aufzubauen.",
        "Du willst Kundinnen und Kunden langfristiger begleiten und ein zusätzliches System neben deiner Hauptleistung etablieren.",
        "Du brauchst eine klare Einschätzung, ob das Modell zu deiner Zielgruppe, Energie und Positionierung passt.",
      ]}
      outcomesTitle="Ein moderner Zusatzweg für Kundenbindung und digitale Erweiterung."
      outcomes={[
        "Ein Online-Shop, der zu deiner Positionierung und Zielgruppe passt.",
        "Produkte, Prozesse und Logistik, die nicht bei dir hängen bleiben müssen.",
        "Eine klare Einladung an deine bestehende Community oder Kundschaft.",
        "Ein skalierbarer Einstieg, der nicht wie ein lauter Sofortkauf-Funnel wirkt.",
      ]}
      sections={[
        {
          title: "Problem",
          body: "Mehr Arbeit bringt nicht automatisch mehr Freiheit. Wenn dein Business nur über deine direkte Zeit wächst, bleibt Wachstum oft an deiner Energie hängen.",
        },
        {
          title: "Reframe",
          body: "Ein digitales Zusatzgeschäft muss nicht bedeuten, dass du alles selbst entwickeln, lagern oder technisch betreiben musst. Es kann an dein bestehendes Business anschließen.",
        },
        {
          title: "Angebotslogik",
          body: "Ein Starter oder Playbook kann ein günstiger Einstieg sein. Die vollständige Implementierung mit Shop, System und Begleitung sollte über Bewerbung oder Clarity Call geführt werden.",
        },
        {
          title: "Clarity Call als Gate",
          body: "Der Call prüft, ob das Modell zum bestehenden Business, zur Zielgruppe und zur gewünschten Begleitung passt. So bleibt das Angebot hochwertig und seriös geführt.",
        },
      ]}
      processEyebrow="Analyze → Strategize → Implement → Invite → Ignite"
      processTitle="Vom bestehenden Business zur digitalen Erweiterung."
      steps={[
        {
          label: "Analyze",
          text: "Wir prüfen bestehendes Business, Zielgruppe, Energie und digitale Anschlussmöglichkeiten.",
        },
        {
          label: "Strategize",
          text: "Aus der Analyse entsteht eine klare Zusatzgeschäft-Strategie, die zu deiner Positionierung passt.",
        },
        {
          label: "Implement",
          text: "Shop, System und Prozesse werden so aufgebaut, dass sie deine bestehende Arbeit sinnvoll erweitern.",
        },
        {
          label: "Invite",
          text: "Deine Community und Kundschaft werden klar, ruhig und passend in das neue Angebot geführt.",
        },
        {
          label: "Ignite",
          text: "Das System wird aktiviert, beobachtet und weiter verfeinert.",
        },
      ]}
      faq={[
        {
          question: "Ist ISOBL ein kompletter Business-Neustart?",
          answer: "Nein. ISOBL ist als digitale Erweiterung gedacht. Es knüpft an dein bestehendes Business, deine Zielgruppe und deine Persönlichkeit an.",
        },
        {
          question: "Muss ich eigene Produkte entwickeln?",
          answer: "Nicht zwingend. Der Ansatz nutzt ein bestehendes System und verbindet es mit deiner Positionierung. Dadurch entstehen weniger Technik-, Produkt- und Logistiklasten.",
        },
        {
          question: "Was ist der Unterschied zwischen Starter und Implementation?",
          answer: "Ein Starterprodukt kann Orientierung geben. Die vollständige Umsetzung mit System, Shop und Begleitung ist eine größere Entscheidung und sollte im Clarity Call geprüft werden.",
        },
      ]}
      finalTitle="Wenn dein Business digital wachsen soll, ohne lauter zu werden."
      finalText="Dann ist der nächste Schritt nicht mehr Information, sondern eine klare Prüfung: Passt ISOBL zu deinem Business, deiner Zielgruppe und deinem gewünschten Wachstum?"
    />
  );
}
