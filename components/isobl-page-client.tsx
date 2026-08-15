"use client";

import {usePathname} from "next/navigation";
import {MarketingOfferPage} from "@/components/marketing-offer-page";
import {getIsoblPartnerImage} from "@/lib/isobl-partner-images";

export function IsoblPageClient() {
  const pathname = usePathname() ?? "";
  const isGerman = pathname === "/de/isobl" || pathname.startsWith("/de/isobl");

  if (isGerman) {
    return (
      <MarketingOfferPage
        locale="de"
        eyebrow="ISOBL"
        title="Erweitere deine Praxis online - und verdiene wiederkehrend mit deinem Fachwissen"
        intro="Betreue deine Kunden über jede Sitzung hinaus. Schaffe dir ein stabiles, wiederkehrendes Einkommen auf Grundlage deines vorhandenen Fachwissens."
        primaryCta="JA, ICH MÖCHTE MEHR ÜBER ISOBL ERFAHREN"
        primaryHref="https://cal.com/heikeziegler/clarity-call"
        secondaryCta="Zurück zur Homepage"
        backHref="/de#angebote"
        audienceTitle="Für wen ist ISOBL gedacht?"
        audienceItems={[
          "Naturheilkunde, Homöopathie und funktionelle Medizin",
          "Chiropraktik und Osteopathie",
          "Ernährungstherapie und Gesundheitscoaching",
          "Yoga, Atemarbeit und somatische Praktiken",
          "Energiearbeit, Heilkünste und integrative Therapien",
          "Persönlichkeitsentwicklung und Wellness-Beratung",
          "Klienten zwischen den Sitzungen begleiten möchten",
          "Langfristige Kundenbeziehungen aufbauen, ohne zusätzliche Arbeitsstunden zu investieren",
          "Ein stabiles, wiederkehrendes Einkommen schaffen, das nicht vollständig von Buchungen abhängt",
          "Für die gesamte Bandbreite ihrer Fachkompetenz anerkannt werden"
        ]}
        outcomesTitle="Deine Praxis hat bereits alles. Füge das richtige System hinzu."
        outcomes={[
          "Die Kundenbetreuung über den Sitzungsraum hinaus erweitern.",
          "Durch sorgfältig ausgewählte Produktempfehlungen zusätzliche Einnahmen generieren.",
          "Wichtige Prozesse automatisieren, sodass du nicht mehr jede Stunde gegen jeden Euro eintauschen musst.",
          "Die Kundenbeziehungen durch kontinuierliche Kontaktpunkte vertiefen.",
          "Mehr Unabhängigkeit und Stabilität bei deinem Einkommen verschaffen."
        ]}
        sections={[
          {
            title: "Dein Fachwissen ist die Grundlage",
            body: "Den schwierigsten Teil hast du bereits hinter dir. Du hast Vertrauen aufgebaut. Du hast das Wissen und die Beziehungen entwickelt, die das Herzstück deiner Praxis bilden. ISOBL gibt dir die Möglichkeit, diesem Vertrauen auch über die Sitzungen hinaus gerecht zu werden. Du kuratierst unter deinem eigenen Namen ein Gesundheitsökosystem, das denselben Standards unterliegt wie deine Praxis."
          },
          {
            title: "Zwei Einstiegsmöglichkeiten - Dein Tempo, deine Wahl",
            body: "Ohne Abonnement:\n- Einfacher Einstieg mit geringem Risiko\n- Kunden stöbern in Produkten in ihrem eigenen Tempo\n- Wiederkehrende Bestellungen entwickeln sich organisch\n- Vertrauen aufbauen, bevor du expandierst\n\nMit Abonnement / Mitgliedschaft:\n- Formalisiere die kontinuierliche Kundenbetreuung\n- Schaffe vorhersehbare, stabile monatliche Einnahmen\n- Vertiefe langfristige Kundenbeziehungen\n- Ideal für Fachleute, die bereit sind zu expandieren\n\nViele Dienstleister beginnen ohne Abonnement und führen Mitgliedschaftsoptionen ein, sobald sie sehen, wie selbstverständlich ihre Kunden darauf ansprechen. Kein Druck, alles auf einmal zu tun."
          },
          {
            title: "Eine Sprache, die zu deinen Werten passt",
            body: "ISOBL spricht die Sprache der Fürsorge:\n- Online-Shop → Dein Wellness-Hub\n- Einnahmequelle → Eine nachhaltige Praxis\n- Abonnementmodell → Kontinuierliche Kundenbetreuung\n- Digitales Geschäft → Umfassendes Betreuungssystem\n- Produkte → Sorgfältig ausgewählte Empfehlungen\n- Verkauf → Beratung"
          },
          {
            title: "Systeme dienen Kunden besser als hektisches Arbeiten",
            body: "Viele Fachleute versuchen, ihr Geschäft auszubauen, indem sie mehr Arbeit annehmen. Mehr Sitzungen. Mehr Verfügbarkeit. Mehr Druck.\n\nMehr Druck führt selten zu Entlastung: weder für dich noch für deine Kunden. Die erfolgreichsten Praktiker bauen Systeme, die:\n- Klienten auch über die Sitzungen hinaus konsequent unterstützen\n- ein nachhaltiges Einkommen schaffen, ohne dafür mehr Zeit aufzuwenden\n- dafür sorgen, dass dein Fachwissen über deinen Zeitplan hinaus wirkt\n- dir Freiraum schaffen, um dich auf die Arbeit zu konzentrieren, die nur du leisten kannst\n\nGenau das macht ISOBL möglich."
          }
        ]}
        processEyebrow="Was du mit ISOBL erhältst"
        processTitle="Dein Fachwissen. Unser System."
        steps={[
          {
            label: "Eigene Plattform",
            text: "Eine professionelle Wellness-Plattform unter deinem Namen. Eine moderne, sofort einsatzbereite Online-Präsenz, die deine Marke und deine Werte widerspiegelt. Keine technischen Kenntnisse erforderlich."
          },
          {
            label: "Premium Produkte",
            text: "Hochwertige, sorgfältig ausgewählte Produkte. Zertifiziert. Getestet. Ausgewählt für Gesundheit, Schönheit, Fitness und Wellness. Produkte, die du mit gutem Gewissen empfehlen kannst."
          },
          {
            label: "Logistische Abwicklung",
            text: "Umfassende logistische Unterstützung. Kein Lagerbestand. Kein Verpacken. Kein Versand. Keine Retourenabwicklung. Kein gebundenes Kapital. Professionelle Partner kümmern sich um alles."
          },
          {
            label: "Flexible Struktur",
            text: "Flexible Umsatzstruktur. Wähle das Modell, das zu deiner Praxis passt. Beginne mit einfachen Produktempfehlungen und lasse wiederkehrende Bestellungen sich natürlich entwickeln. Oder führe ein strukturiertes Mitgliedschaftsmodell ein."
          },
          {
            label: "Begleitung & Skalierung",
            text: "Ein skalierbares System, das mit dir wächst. ISOBL lässt sich in deine bestehende Praxis integrieren und ergänzt deine Arbeit. Persönliche Begleitung während des gesamten Prozesses."
          }
        ]}
        storiesSub="Was Praktiker sagen"
        storiesTitle="10 Praktiker. Ein Hub. Stabile Einnahmen und tiefere Kundenbeziehungen."
        stories={[
          {
            title: "1. Die Naturheilpraktikerin, die Kunden zwischen den Terminen nicht mehr verlor",
            body: "Kunden verließen die Sitzungen motiviert. Vor dem nächsten Besuch fielen sie in alte Gewohnheiten zurück.\nSie startete einen Wellness-Shop mit Produkten, die sie ohnehin empfahl. Kunden begannen, zwischen den Terminen zu bestellen.\nDie Produkte wurden zum täglichen Kontaktpunkt. Die Wiederkehrquote stieg. Und die Sitzungen wurden produktiver, weil Kunden ihre Empfehlungen tatsächlich umsetzten."
          },
          {
            title: "2. Die Akupunkteurin, die zum ersten Mal unabhängig von ihrer Anwesenheit verdiente",
            body: "Eine Handverletzung zwang sie zu einer zweiwöchigen Pause. Ihr Einkommen: null.\nSie hatte bereits einen kleinen Shop für Wellnessprodukte eingerichtet. Während der Genesung gingen weiterhin Bestellungen ein. Das deckte ihre Fixkosten.\nSie sagt, es war das erste Mal in fünfzehn Jahren ihrer Praxis, dass sie sich finanziell abgesichert fühlte."
          },
          {
            title: "3. Die Gesundheitsberaterin, die aufhörte, sich für Empfehlungen zu entschuldigen",
            body: "Sie vermied Produktempfehlungen, weil sie nicht aufdringlich wirken wollte.\nDann baute sie unter eigenem Namen eine Produktplattform auf, nur mit dem, was sie selbst nutzte. Empfehlungen wurden Teil ihres Betreuungskonzepts. Kunden schätzten die Auswahl.\nSie hörte auf, sich zu entschuldigen, und sah Produkte als Teil ihrer Beratung."
          },
          {
            title: "4. Die Yogalehrerin, die Schüler jenseits ihres Studios erreichte",
            body: "Volle Kurse. Warteliste. Kein Wachstum ohne zweiten Standort oder Personal.\nIhr Hub mit Produkten zur Schlafunterstützung und Sitzungen zum Reset der Lebensenergie erreichte Schüler, die ihr online folgten, aber zu weit entfernt wohnten.\nInnerhalb von sechs Monaten stammte ein bedeutender Teil ihres Einkommens von Menschen, die sie nie persönlich getroffen hatte."
          },
          {
            title: "5. Der Osteopath, der aus Einmalkunden dauerhafte Beziehungen machte",
            body: "Kunden kamen mit einem Problem, ließen es beheben und tauchten erst bei der nächsten Verletzung auf.\nEr führte eine einfache Mitgliedschaft ein: monatliche Lieferung von Gelenkprodukten und Regenerationshilfen sowie Sitzungen zum Reset der Lebensenergie.\nDie Mitgliedschaft gab ihm einen Grund, in Kontakt zu bleiben. Kunden, die zuvor einmal im Jahr kamen, melden sich jetzt monatlich. Einige kehrten zur regelmäßigen Behandlung zurück."
          },
          {
            title: "6. Die Ernährungstherapeutin, die vierzig Minuten pro Woche zurückgewann",
            body: "Bei jeder Beratung erklärte sie, welche Produkte zu kaufen, wo sie erhältlich waren und wie sie anzuwenden waren. Klienten kauften dann oft das Falsche oder gar nichts.\nIhre Plattform bündelte alles an einem einzigen geprüften Ort. Die Gespräche wurden kürzer. Die Kunden kamen besser vorbereitet.\nErgebnis: etwa vierzig Minuten pro Woche mehr für die eigentliche Arbeit."
          },
          {
            title: "7. Die integrative Therapeutin, die einen zweiten Zugang zu neuen Klienten fand",
            body: "Ihr Hub zog Menschen an, die nie von ihrer Praxis gehört hatten. Sie fanden ein Produkt, lasen die Begründung und buchten eine Sitzung zum Reset der Lebensenergie.\nSie nennt es ihren „langsamen Trichter\": gemächlich, werteorientiert und ganz im Einklang mit dem, was sie ausmacht."
          },
          {
            title: "8. Die Fitnesstrainerin, die aus einer Stunde eine 24-Stunden-Beziehung machte",
            body: "Sie war die wichtigste Stunde ihres Tages. Die anderen dreiundzwanzig? Außerhalb ihres Einflussbereichs.\nSie baute eine Plattform rund um das, was sie ohnehin verschrieb: Proteinmischungen, Regenerationshilfen, Schlafunterstützung und Beweglichkeit.\nKunden folgten einem schlüssigen Protokoll statt improvisierter Ernährung. Die Ergebnisse verbesserten sich. Die Kunden erzählten anderen davon. Ihre Warteliste wuchs."
          },
          {
            title: "9. Die Salonbesitzerin, die ihre Empfehlungen endlich durchsetzte",
            body: "Jahrelang empfahl sie professionelle Hautpflegeprodukte. Kunden verließen den Salon und kauften in der Apotheke günstigere Alternativen.\nIhr Hub führte dieselben Produktlinien, die sie bei Behandlungen verwendete, sowie ergänzende Produkte zur Selbstpflege. Er wurde zur Brücke zwischen Behandlungsraum und Alltag.\nKunden, die alle sechs Wochen zur Gesichtsbehandlung kamen, bestellten jetzt regelmäßig nach. Zu jedem Produkt gab es einen Hinweis auf die passende Salonbehandlung. Die Buchungen stiegen."
          },
          {
            title: "10. Das Hotel-Spa, das den Check-out zum Anfang machte",
            body: "Für die meisten Hotel-Spas endet die Beziehung zum Gast beim Check-out. Eine Spa-Leiterin erkannte darin ihr zentrales Problem: außergewöhnliche Erlebnisse ohne Kontinuität.\nSie baute eine Plattform auf, die zur Philosophie des Spas passte: Produkte zur Regeneration von Körper und Seele sowie Sitzungen zur Wiederherstellung der Lebensenergie. Vorgestellt am Ende jeder Behandlung, genau dann, wenn die Gäste am empfänglichsten waren.\nGäste bestellten, weil sie das Gefühl aus dem Spa-Raum mit nach draußen nehmen wollten. Innerhalb eines Jahres stammte ein bedeutender Teil des Umsatzes von Gästen, die dort vor Monaten oder Jahren übernachtet hatten und seitdem regelmäßig bestellt hatten."
          }
        ]}
        interviewsSub="Erfolgsgeschichten"
        interviewsTitle="ISOBL-Erfolgsgeschichten – 8 Kunden-Interviews von ISOBL-Partnern"
        interviews={[
          {
            ...getIsoblPartnerImage(1, "de"),
            name: "ISA 1 – Angela H. - Fitnesstrainerin",
            quote: "„Ich habe innerhalb weniger Tage 10 hartnäckige Pfund abgenommen – und halte mein Gewicht seit 9 Jahren.\"",
            paragraphs: [
              "Ich hatte die Unternehmenswelt hinter mir gelassen und mich zur Lehrerin umschulen lassen.",
              "Während meines Praktikums nahm ich zu. Das Gewicht ließ sich einfach nicht loswerden. Sport half nicht. Kalorien reduzieren half nicht. Nichts funktionierte. Ich war verzweifelt genug, um etwas Neues auszuprobieren.",
              "Nach drei oder vier Tagen dachte ich: „Das kann doch nicht sein.“ Diese 10 Pfund, die mich monatelang begleitet hatten? Weg. Und sie sind seitdem weggeblieben. Das ist jetzt fast neun Jahre her.",
              "Heute fühle ich mich körperlich besser als je zuvor. Meine Energie ist durch die Decke gegangen. Ich gebe eine Trainingseinheit nach der anderen, verbringe den ganzen Tag im Garten und fühle mich abends immer noch großartig. Meine Erholung zwischen den Trainingseinheiten? Phänomenal."
            ]
          },
          {
            ...getIsoblPartnerImage(2, "de"),
            name: "ISA 2 – Heather - Personal Trainerin und Ernährungsberaterin",
            quote: "Wie eine skeptische Sporttrainerin ein florierendes Unternehmen aufbaute, indem sie weitergab, was bei ihren Kunden tatsächlich funktionierte.",
            paragraphs: [
              "Mir ging es immer knapp mit dem Geld. Ich war ständig pleite. Ich komme aus einer Familie von Sorgenmachern. Ich habe gesehen, wie meine Mutter ihr ganzes Leben lang gekämpft hat. Das hat mir Angst gemacht.",
              "Dann sah mich eines Tages mein Sohn Louis mit demselben besorgten Blick an, den ich früher hatte, wenn ich meine Mutter beobachtete. Das traf mich hart.",
              "Als Spitzensportlerin, Personal Trainerin und Ernährungsberaterin glaube ich an die Vollwertkost. Ich hielt nichts von Nahrungsergänzungsmitteln. Als Sportlerin wurde ich mit Produkten gesponsert, die weder meiner Gesundheit noch meiner Leistung förderlich waren. Als mir meine Großnichten ein neues Produkt mitbrachten, war mein erster Gedanke: „Auf keinen Fall.“ Aber ich vertraute ihnen. Und ich sah, was passierte, als ich die Produkte an meine Kunden weitergab.",
              "Mein Personal-Training-Geschäft boomte. Andere Trainer wollten wissen, was ich tat. Andere Fitnessstudios kamen auf mich zu. Da wurde mir klar: Mein Einkommen und mein Leben könnten sich tatsächlich verändern.",
              "Der eigentliche Wendepunkt kam, als eine Kundin unter Tränen zu mir kam. Sie liebte die Produkte. Sie hatte erstaunliche Ergebnisse erzielt. Zum ersten Mal seit Jahren hatte sie das Gefühl, ihre Gesundheit im Griff zu haben.",
              "Dann ging ihr Unternehmen über Nacht pleite. Sie verlor alles. Was ihr am meisten das Herz brach: Sie konnte sich die Produkte nicht mehr leisten. Dieser Moment hat für mich alles verändert. Ich hätte ihr früher sagen können, dass sie sich die Produkte kostenlos verdienen oder eine zusätzliche Einnahmequelle aufbauen könnte. Dann hätte sie ein Sicherheitsnetz gehabt, als die Katastrophe zuschlug. Dieses Geschäft gab mir die Wahlfreiheit, die Flexibilität und die Sicherheit, die ich brauchte."
            ]
          },
          {
            ...getIsoblPartnerImage(3, "de"),
            name: "ISA 3 – Ilse & Tim, Vertriebsmitarbeiterin & Polizeibeamter",
            quote: "Ein Paar, das durch Schichtarbeit auseinandergerissen wurde, baute gemeinsam ein Geschäft auf – und gewann sein Leben zurück.",
            paragraphs: [
              "Ilse: Ich war Vollzeit-Vertriebsmitarbeiterin. Als ich nach Hause kam, war ich völlig erschöpft. Und Tim war nie da, weil er Nachtschicht hatte.",
              "Tim: Ich war ständig von zu Hause weg. Ilse aß allein. Sie schlief allein. Wenn ich sie sehen wollte, sah ich mir ein Foto an, das ich in meiner kugelsicheren Weste aufbewahrte. In meinem Job wurde ich geschätzt. Aber ständig von seiner Frau getrennt zu sein, bricht einem das Herz.",
              "Ilse: Als wir vor zwei Jahren mit dem Geschäft in Berührung kamen, haben wir uns zum ersten Mal gefragt: Vielleicht muss das Leben gar nicht so sein.",
              "Tim: Ich war skeptisch. Wenn etwas zu gut klingt, um wahr zu sein, ist es das meistens auch. Ich dachte, ich wüsste schon alles. Rückblickend hatte ich Unrecht. Also beschlossen wir, offen zu sein. Welche Möglichkeiten gibt es? Wie könnte das unser Leben verändern?",
              "Ilse: Wir haben angefangen, als er noch Nachtschichten hatte. Tagsüber hat er neue Kunden akquiriert, während ich in meinem Vollzeitjob tätig war. An den Wochenenden, wenn er 12-Stunden-Schichten hatte, habe ich dort weitergemacht, wo er aufgehört hatte. Wir haben uns gegenseitig geholfen und uns über alles auf dem Laufenden gehalten.",
              "Tim: Wir haben uns vom ersten Tag an gegenseitig zur Rechenschaft gezogen. Wir haben beschlossen: Sobald wir anfangen, bringen wir es zum Laufen. Konsequent sein. Uns gegenseitig unterstützen. Es war wunderschön zu sehen, wie wir uns zusammen weiterentwickelt haben. Früher hat uns das Leben auseinandergebracht. Jetzt arbeiten wir gemeinsam an unseren Träumen. Sei mutig. Mach eine ehrliche Bestandsaufnahme deines Lebens und schau, was fehlt.",
              "Ilse: Probier es einfach aus. Wenn es das Richtige für dich ist, super. Wenn nicht, ist das auch okay. Aber was wäre, wenn? Jetzt verbringen wir echte Zeit miteinander. Ich esse nicht mehr allein. Wir essen gemeinsam zu Abend. Wir reisen zusammen.",
              "Tim: Als mein Vater vor sechs Monaten verstorben ist, hat das meine Sicht auf die Zeit verändert. Ich durfte seinen letzten Monat mit ihm verbringen. Mich um ihn kümmern. Mit ihm weinen. Für ihn da sein. Das werde ich für immer in Ehren halten. Ohne unser Unternehmen wäre das nicht möglich gewesen."
            ]
          },
          {
            ...getIsoblPartnerImage(4, "de"),
            name: "ISA 4 – Lara E. - Krankenschwester im NHS",
            quote: "Ich habe genug zusätzliches Einkommen erzielt, um meinen Mutterschaftsurlaub von 5 auf 15 Monate zu verlängern.",
            paragraphs: [
              "Ich arbeitete als Krankenschwester beim NHS, 60 Stunden pro Woche. Das meiste davon war erzwungene Überstunden, da jede Schicht unterbesetzt war.",
              "Ich benutzte die Produkte schon seit Jahren und liebte sie. Sie waren Teil meines Alltags. Dann bekam ich meinen kleinen Jungen, Oliver. Alles änderte sich. Mein Mutterschaftsgeld sank. Ich wollte nicht vorzeitig zurückkehren. Ich hatte immer vor, das ganze Jahr zu nehmen.",
              "Ich unterhielt mich mit befreundeten Krankenschwestern, die sich durch das Geschäft bereits ein solides Einkommen erarbeitet hatten. Ich dachte mir: Wenn sie das schaffen, warum nicht auch ich?",
              "Ich habe mich reingehängt. Es wie ein Geschäft behandelt. Eine tägliche Routine aufgebaut. Und schon bald begann ich, zusätzliches Geld zu verdienen. Ich musste nicht an die Arbeit zurückkehren, als mein Sohn fünf Monate alt war. Ich verlängerte meinen Mutterschaftsurlaub auf fünfzehn Monate. Unbezahlbar."
            ]
          },
          {
            ...getIsoblPartnerImage(5, "de"),
            name: "ISA 5 – Lissa A. - Inhaberin eines Kosmetiksalons",
            quote: "Ich habe eine Produktlinie eingeführt, die meine Kundinnen von sich aus nachbestellen – und dadurch eine bessere Work-Life-Balance gefunden.",
            paragraphs: [
              "Als Inhaberin eines Kosmetiksalons, Mutter und Ehefrau war mein Leben schon ausgefüllt, bevor ich etwas Neues hinzugefügt habe.",
              "Ich hatte meinen Salon seit über acht Jahren und arbeitete zwölf Stunden am Tag. Wenn man so viele Stunden arbeitet, kann man seine Leidenschaft verlieren. Das machte mir Angst.",
              "Ilse kontaktierte mich über Instagram. Ich war skeptisch, aber ich sagte: „Klar, komm vorbei, lass uns reden.“ Sie zeigte mir die Vorher-Nachher-Bilder. Ich war sofort begeistert. Die Ergebnisse sprachen für sich: Haut, Nägel, Haare, einfach alles. Und es ist so einfach. Die Kundinnen lieben die Produkte, weil sie diese von sich aus immer wieder nachbestellen. Großartig für mich.",
              "Ich habe auch meine Eltern gebeten, die Produkte auszuprobieren, da meine Kunden sie täglich im Salon sehen. Beide haben gleichzeitig angefangen. Ihre Ergebnisse nach 30 Tagen waren beeindruckend. Die Vorher-Nachher-Bilder meiner Eltern haben mein Geschäft deutlich ausgebaut.",
              "Jetzt teile ich meine Erfahrungen mit anderen Saloninhabern. Am liebsten würde ich von den Dächern rufen, wie gut diese Produkte sind und warum sie in jeden Salon gehören. Es hat mir geholfen, eine bessere Work-Life-Balance zu finden."
            ]
          },
          {
            ...getIsoblPartnerImage(6, "de"),
            name: "ISA 6 – Saskia - Personal Trainerin & Ernährungsberaterin",
            quote: "Mit 50 hat sie ihren Körper transformiert – und dann anderen Frauen geholfen, dasselbe zu tun.",
            paragraphs: [
              "Ich habe schlecht geschlafen. Ich habe mich nicht fit gefühlt. Alle gehen davon aus, dass ich als Personal Trainerin in Topform sein muss. Ich sah fit aus. War ich aber nicht. Ich hatte mit Hitzewallungen und Energielosigkeit zu kämpfen. Eine Kundin machte mich mit den Produkten bekannt, und mein erster Gedanke war: Auf keinen Fall.",
              "Wie sollte ich meinen Kundinnen sagen, dass ich Shakes trinke? Jahrelang hatte ich ihnen gesagt, dass sie ihr Gemüse essen sollten. Und jetzt selbst Shakes trinken? Es hat lange gedauert, bis ich sie ausprobiert habe. Dann haben meine eigenen Kunden gesehen, wie ich mich verändert habe. Mein Körper hat sich mit 50 gewandelt, vor drei Jahren.",
              "Ich fühle mich großartig. Und weil sie die Veränderung an mir gesehen haben, haben sie mir geglaubt, als ich sagte, dass diese Produkte wirken. Jetzt helfe ich Frauen mit den Produkten und beim Aufbau ihres eigenen Unternehmens."
            ]
          },
          {
            ...getIsoblPartnerImage(7, "de"),
            name: "ISA 7 – Tinashe - Vertriebsprofi mit Hintergrund im Gesundheitswesen",
            quote: "Hat nach jahrelangen Versuchen 3 kg fettfreie Muskelmasse zugenommen – und seine Energie und sein Selbstvertrauen zurückgewonnen.",
            paragraphs: [
              "Ich komme aus dem Gesundheitswesen. 60 Stunden pro Woche. Ausgebrannt. Immer müde, egal wie viel ich schlief. Schlechte Laune. Unzufrieden mit meinem Leben. Ich wusste, dass es etwas Besseres gab. Ich kam an einen Punkt, an dem ich es satt hatte, ständig müde zu sein. Ich musste etwas ändern.",
              "Aufgrund des Stresses hatte ich viel an Gewicht verloren. Von 65 kg auf 55 kg. Mir gefielen weder mein Aussehen noch wie ich mich fühlte.",
              "Mein Ziel: schlanke Muskelmasse aufbauen. Früher brauchte ich ein halbes Jahr, um ein halbes Kilo zuzunehmen. Als ich mit den Produkten anfing, nahm ich 3 kg zu. Das hatte ich vorher nie geschafft. Von diesem Moment an änderte sich alles. Meine Energie kehrte zurück. Mein Selbstvertrauen kehrte zurück. Ich begann, mich wieder in mich selbst zu verlieben. Die Leute fragten mich, was ich einnehme.",
              "Jeden Morgen voller Vorfreude aufwachen, voller Lebenskraft sein und mich den Menschen um mich herum von meiner besten Seite zeigen: Das verändert alles. Entweder erzielst du Ergebnisse oder bekommst dein Geld zurück. Mach den ersten Schritt."
            ]
          },
          {
            ...getIsoblPartnerImage(8, "de"),
            name: "ISA 8 – Michael B. - Fitnessstudio-Besitzer & Personal Trainer",
            quote: "Er hat seinen Fitnessstudio-Kunden bessere Ergebnisse ermöglicht – und sich daraus eine zweite Einnahmequelle aufgebaut.",
            paragraphs: [
              "Ich bin seit über 20 Jahren in der Fitnessbranche tätig und betreibe ein erfolgreiches Fitnessstudio sowie ein Coaching-Unternehmen. Ich war bereit, die Produkte auf die Probe zu stellen.",
              "Ich habe schnell einen Unterschied bei meinen Kunden festgestellt. Mehr Energie. Bessere Körperform. Am Wettkampftag sahen sie besser aus, erholten sich schneller, hielten ihren Körperfettanteil niedriger und blieben auch lange nach dem Wettkampf in Topform.",
              "75 % der Ergebnisse stammen aus der Ernährung. Nur 25 % aus dem Training. Die richtige Ernährung ist wichtiger als alles andere. Meine Kunden verzeichneten einen deutlichen Gewichtsverlust sowie einen Anstieg der fettfreien Muskelmasse. Die Systeme funktionieren, ganz gleich, was Ihr Ziel ist.",
              "Nachdem ich diese Ergebnisse aus erster Hand gesehen hatte, interessierte ich mich für die Geschäftsmöglichkeit. Keine riesige Investition nötig. Einfach ausprobieren. Ich beschloss, voll darauf zu setzen. Und wenn ich das sage, meine ich es auch so.",
              "Anfangs hatte ich keine Ahnung, was ich da tat. Aber ich habe gehandelt. Erfolg im Geschäft hängt von zwei Dingen ab: Handeln und Beständigkeit. Kein Auf und Ab. Sei das ganze Jahr über konsequent, egal wie viel Zeit du investierst. Die Menschen erkennen, dass diese Chance echt ist. Wenn ich es schaffe, schaffst du es auch."
            ]
          }
        ]}
        faq={[
          {
            question: "Was ist ISOBL?",
            answer: "ISOBL steht für „Instant Success Online Business Launch“. Du bekommst eine professionelle Wellness-Plattform unter deinem Namen, eine ausgewählte Produktpalette, automatisierte Prozesse und vollständige logistische Unterstützung - als digitale Erweiterung deiner bestehenden Praxis."
          },
          {
            question: "Für wen ist ISOBL gedacht?",
            answer: "Für Fachleute aus den Bereichen Gesundheit, Schönheit, Fitness, Coaching, Wellness, Therapie, Energiearbeit sowie verwandten Bereichen. Besonders geeignet, wenn du die Kundenbindung vertiefen oder ein stabileres Einkommen aufbauen möchtest, ohne mehr Stunden zu arbeiten."
          },
          {
            question: "Wie funktioniert ISOBL?",
            answer: "Du erweiterst deine Praxis um einen digitalen Wellness-Kanal. Ausgewählte Produkte werden direkt von Logistikpartnern versendet. Du generierst wiederkehrende Einnahmen und pflegst dauerhafte Kundenbeziehungen, ohne Lager oder Versand selbst zu organisieren."
          },
          {
            question: "Funktioniert ISOBL mit oder ohne Abonnementmodell?",
            answer: "Beides. Du kannst Produkte empfehlen und wiederkehrende Bestellungen natürlich wachsen lassen. Oder du führst von Anfang an ein Mitgliedschaftsmodell ein. Beide Optionen besprechen wir im Clarity Call."
          },
          {
            question: "Muss ich eigene Produkte entwickeln oder einen Shop betreiben?",
            answer: "Nein. Du erhältst ein einsatzbereites Hub-System unter deinem Firmennamen. Lagerung, Verpackung, Versand und Rücksendungen übernehmen unsere Partner."
          },
          {
            question: "Brauche ich technische Vorkenntnisse?",
            answer: "Nein. ISOBL ist so aufgebaut, dass auch Praktiker ohne technischen Hintergrund sicher starten können. Klare Abläufe und persönliche Betreuung sind inklusive."
          },
          {
            question: "Welche Produkte werden angeboten?",
            answer: "Hochwertige Produkte aus Gesundheit, Schönheit, Fitness, Wellness und Lifestyle - abgestimmt auf deine Praxis und deine Kunden. Viele eignen sich für wiederkehrende Bestellungen."
          },
          {
            question: "Kann ich ISOBL mit meiner bestehenden Praxis kombinieren?",
            answer: "Ja. Genau dafür wurde es entwickelt. Deine Kundenbeziehungen, dein Fachwissen und deine lokale Präsenz bleiben die Grundlage."
          },
          {
            question: "Ist ISOBL für lokale oder klinikbasierten Praxen geeignet?",
            answer: "Ja. ISOBL verbindet deine lokale Präsenz mit digitaler Reichweite: mehr Sichtbarkeit, digitale Erreichbarkeit und Einnahmen, die auch dann anfallen, wenn dein Behandlungsraum ausgebucht ist."
          },
          {
            question: "Kann ich international verkaufen?",
            answer: "Ja. Das System ist international ausgerichtet und von überall nutzbar."
          },
          {
            question: "Wie unterstützt ISOBL die Kundenbindung?",
            answer: "ISOBL verbindet deinen persönlichen Ansatz mit modernen Online-Systemen. Kunden bleiben länger gebunden und kehren regelmäßiger zurück. Mitgliedschaftsmodelle fördern dauerhafte Beziehungen, die widerspiegeln, was du bereits in deinen Sitzungen anbietest."
          },
          {
            question: "Wie viel kostet ISOBL?",
            answer: "Die Investition hängt von der für deine Praxis passenden Lösung ab. Deshalb beginnt der Prozess mit einem kostenpflichtigen Clarity Call. Dort analysieren wir deine Praxis, dein Wachstumspotenzial und deine Ziele."
          },
          {
            question: "Warum ist der Clarity Call kostenpflichtig?",
            answer: "Es ist eine echte strategische Analyse. Wir nehmen uns die Zeit, deine Praxis gründlich zu verstehen - genau so, wie du es bei einem neuen Klienten tun würdest. Das Honorar spiegelt den Wert dieser Zeit wider und stellt sicher, dass wir beide gut vorbereitet sind."
          },
          {
            question: "Wie läuft der Bewerbungsprozess ab?",
            answer: "Du buchst deinen Clarity Call. Wir analysieren gemeinsam deine Praxis und deine Optionen. Wir prüfen ehrlich, ob ISOBL der nächste richtige Schritt ist. Wenn ja, bewirbst du dich für die Teilnahme."
          },
          {
            question: "Wie schnell kann ich loslegen?",
            answer: "Viele Praxisinhaber starten ihren Wellness-Hub zügig. Die Geschwindigkeit hängt von deiner Praxis, deiner Positionierung und deinem Tempo ab. Du wirst durchgehend unterstützt."
          },
          {
            question: "Ist ISOBL ein Network-Marketing-Programm?",
            answer: "ISOBL verbindet modernes Online-Geschäft mit B2B- und B2C-Cross-Marketing sowie Mitgliedersystemen. Der Fokus: etablierte Praxen über digitale Kanäle sinnvoll erweitern und nachhaltiges Zusatzeinkommen aufbauen. Es richtet sich an Praktiker, die sich beruflich weiterentwickeln wollen."
          },
          {
            question: "Was zeichnet ISOBL aus?",
            answer: "ISOBL vereint deine Praxis, digitale Systeme, wiederkehrende Einnahmen, automatisierte Unterstützung, eine Community und moderne Kundenbindung in einem übersichtlichen, umsetzbaren System. Für Praktiker, die online wachsen und dabei ihrer Arbeitsweise treu bleiben wollen."
          }
        ]}
        finalTitle="Dein nächster Schritt: Das Clarity-Gespräch"
        finalText="Wir analysieren deine aktuelle Praxis, zeigen verborgene Wachstumspotenziale auf, bewerten deine digitale Bereitschaft, besprechen deine Ziele und klären ehrlich, ob ISOBL der richtige nächste Schritt für dich ist. Dauer ca. 30 Min. | 69 €"
      />
    );
  }

  // English Copy
  return (
    <MarketingOfferPage
      locale="en"
      eyebrow="ISOBL"
      title="Instant Success Online Business Launch"
      intro="Serve Your Clients Beyond Every Session - and Build Stable, Recurring Income From Your Existing Expertise"
      primaryCta="YES, I'D LIKE TO LEARN MORE ABOUT ISOBL"
      primaryHref="https://cal.com/heikeziegler/application-instant-success-online-business-launch"
      secondaryCta="Back to the homepage"
      backHref="/en#angebote"
      audienceTitle="Who Is ISOBL For?"
      audienceItems={[
        "Naturopathy, Homeopathy, and Functional Medicine",
        "Chiropractic and Osteopathy",
        "Nutritional Therapy and Health Coaching",
        "Yoga, Breathwork, and Somatic Practices",
        "Energy Work, Healing Arts, and Integrative Therapies",
        "Personal Development and Wellness Consulting",
        "Support clients consistently between sessions",
        "Build long-term client relationships without adding more hours",
        "Create a stable, recurring income that doesn't depend entirely on bookings",
        "Be recognized for the full depth of their expertise"
      ]}
      outcomesTitle="Your Practice Already Has What It Needs. Add the Right System."
      outcomes={[
        "Extend client support beyond the session room?",
        "Generate additional revenue through curated product recommendations?",
        "Automate key processes so you stop trading every hour for every dollar?",
        "Deepen client relationships through ongoing, meaningful touchpoints?",
        "Give you greater independence and stability in your income?"
      ]}
      sections={[
        {
          title: "Your Expertise Is the Foundation",
          body: "You've already done the hardest part. You've built trust and developed the knowledge and relationships that form the heart of your practice. ISOBL gives you a way to honor that trust beyond your sessions.\n\n\"Think of this as curating a health ecosystem under your own name, held to the same standards as your practice.\""
        },
        {
          title: "Two Ways to Start - Your Choice, Your Pace",
          body: "Without a Subscription:\n- A simple, lower-risk starting point\n- Clients find products at their own pace\n- Recurring orders develop organically\n- Build confidence before expanding\n\nWith a Subscription / Membership:\n- Formalize ongoing client support\n- Create predictable, stable monthly income\n- Deepen long-term client relationships\n- Ideal for practitioners ready to scale\n\nMany practitioners begin without a subscription model and introduce membership options once they see how naturally their clients engage. There's no pressure to do everything at once."
        },
        {
          title: "Language That Fits Your Values",
          body: "ISOBL is built around the language of care, not commerce:\n- Onlinestore → Your wellness hub\n- Revenue stream → A sustainable practice\n- Subscription model → Ongoing client support\n- Digital business → Extended care system\n- Products → Curated recommendations\n- Selling → Guiding"
        },
        {
          title: "Systems Serve Clients Better Than Hustle",
          body: "Many practitioners try to grow by taking on more work. More sessions. More availability. More pressure.\n\nMore pressure rarely brings more ease - for you or your clients. The most effective practitioners build systems that:\n- Support clients consistently beyond sessions\n- Create sustainable income without requiring more of your time\n- Enable your expertise to reach further than your schedule allows\n- Free you to focus on the work only you can do\n\nThat's what ISOBL makes possible."
        }
      ]}
      processEyebrow="What You Get With ISOBL"
      processTitle="A Scalable System That Grows With You"
      steps={[
        {
          label: "A Professional Wellness Hub Under Your Name",
          text: "A modern, ready-to-use online presence that reflects your brand and values. No technical skills required."
        },
        {
          label: "High-Quality, Curated Products",
          text: "Certified. Tested. Carefully selected for health, beauty, fitness, and wellness. Products you can recommend with confidence because they align with what you already stand for."
        },
        {
          label: "Full Logistics Support",
          text: "No inventory. No packing. No shipping. No returns management. No capital tied up in stock. Professional partners handle everything."
        },
        {
          label: "Flexible Revenue Structure",
          text: "Choose the model that suits your practice. Start with straightforward product recommendations and let recurring orders develop naturally. Or introduce a structured membership model that formalizes long-term client support from day one."
        },
        {
          label: "Personal Guidance Throughout",
          text: "You don't have to figure this out alone. You receive individual support to ensure ISOBL fits your situation, your clients, and your goals."
        }
      ]}
      storiesSub="10 practitioners built lasting client relationships and steady income with ISOBL."
      storiesTitle="Here's what happened."
      stories={[
        {
          title: "1. The Naturopath Who Stopped Losing Clients Between Appointments",
          body: "Clients left sessions motivated, then drifted back into old habits before the next visit.\nAfter launching her wellness hub with supplements and functional foods she already recommended, clients began ordering between sessions. The products became a daily touchpoint. Return rates improved. Clients arrived having actually followed through, making sessions more productive for everyone."
        },
        {
          title: "2. The Acupuncturist Who Built Income That Didn't Depend on Her Being There",
          body: "A minor hand injury forced her to take two weeks off. Her entire income vanished.\nShe had already set up a small hub with wellness products she trusted. During recovery, orders kept arriving. It covered her fixed costs and removed the panic. She calls it the first time she felt financially resilient in fifteen years of practice."
        },
        {
          title: "3. The Health Coach Who Finally Felt Comfortable Recommending Products",
          body: "She had always avoided recommending products because she didn't want to seem salesy. Once she built a curated hub under her own name, selecting only what she genuinely used, the dynamic shifted. Recommendations were incorporated into her care protocol. Clients appreciated the curation. She stopped apologizing and started treating products as extensions of her advice."
        },
        {
          title: "4. The Yoga Teacher Who Reached Students Beyond Her Studio",
          body: "Full classes. A waiting list. No way to grow without a second location or staff she couldn't afford. Her wellness hub, sleep-support products, and offer of life-energy reset sessions reached students who followed her online but lived too far away for class. Within six months, a meaningful portion of her income came from people she had never met in person."
        },
        {
          title: "5. The Osteopath Who Turned One-Off Clients Into Long-Term Relationships",
          body: "Most clients came in for a specific issue, got it resolved, and disappeared until the next injury. He introduced a lightweight membership through his hub: a monthly delivery of joint-support supplements and recovery tools, along with an offer of life-energy reset sessions. The membership gave him a reason to stay in contact without it feeling clinical. Clients who had previously visited once a year began engaging monthly, and several returned to regular treatment."
        },
        {
          title: "6. The Nutritional Therapist Who Stopped Reinventing the Wheel",
          body: "Every consultation meant explaining which products to buy, where to find them, and how to use them. Clients often came back having bought the wrong thing, or nothing at all. Her hub consolidated everything into one trusted, pre-vetted place. Consultations became shorter and more focused. She reclaimed roughly forty minutes per week, and clients arrived better prepared."
        },
        {
          title: "7. The Integrative Therapist Who Found a Second Community",
          body: "Her hub attracted people who had never heard of her practice. They found a product, read her perspective on why she recommended it, and booked a life-energy reset session. She calls it her \"slow funnel\": unhurried, values-led, and entirely aligned with who she is.\n\nThe thread running through these seven: None of them set out to build a business. They set out to serve their clients better, and the income followed naturally. The hub gave what they already were, somewhere further to reach."
        },
        {
          title: "8. The Fitness Coach Who Turned a 60-Minute Session Into a 24-Hour Relationship",
          body: "She was the most important “hour“ in her clients' day. The other twenty-three were beyond her influence. She curated a hub around what she already prescribed: protein formulas, recovery tools, sleep support, and mobility aids. Clients who had previously improvised their nutrition now followed a coherent protocol she had built for them. Results improved. Clients attributed those results to the entire system she had created and to her telling others about it. Her waiting list grew because clients were getting better outcomes and saying so."
        },
        {
          title: "9. The Salon Owner Who Stopped Watching Clients Buy the Wrong Things",
          body: "For years, she recommended professional-grade skincare, only to watch clients leave and buy cheaper alternatives from pharmacies or algorithm-driven platforms. Her wellness hub, carrying the same lines she used in treatments plus complementary self-care items, became the bridge between her treatment room and their daily routine. Clients who visited every six weeks for a facial began purchasing between appointments. The hub also introduced new treatments naturally: a product carried a short note about the in-salon service it complemented, and bookings increased organically."
        },
        {
          title: "10. The Hotel Spa That Turned Checkout Into the Start of the Relationship",
          body: "For most hotel spas, the guest relationship ends at checkout. One spa director recognized this as her central problem: extraordinary experiences with no continuity. She built a hub curated around the spa's philosophy: products for body-and-soul reset and life-energy reset sessions. She introduced it at the moment guests were most receptive: the end of a treatment. Guests who ordered through the hub were buying their way back to how they felt in that room. Within a year, a meaningful portion of revenue came from guests who had stayed once, sometimes years earlier, and had never stopped ordering. The hub turned a transactional hospitality business into something closer to a wellness community.\n\nWhat these 10 stories show: The naturopath, acupuncturist, and health coach were extending care. The fitness coach needed influence beyond the session. The salon owner needed a presence in the daily routine. The hotel spa needed a reason to exist after checkout. Each was solving a continuity problem that had always been there. The hub gave its client relationships somewhere to go."
        }
      ]}
      interviewsSub="ISOBL Success Stories"
      interviewsTitle="ISOBL Success Stories – 8 Customer Interviews from ISOBL Partners"
      interviews={[
        {
          ...getIsoblPartnerImage(1, "en"),
          name: "ISA 1 - Angela Hancock, Fitness Instructor",
          quote: "Lost 10 stubborn pounds in days - and kept them off for 9 years.",
          paragraphs: [
            "I'd left the corporate world and was retraining as a school teacher. During my placement, I put on weight that refused to shift. Exercise didn't help. Cutting calories didn't help. Nothing worked.",
            "I was desperate enough to try something new.",
            "Within three or four days, I thought, \"This stuff is amazing.\"",
            "Those 10 pounds that had stuck with me for months? Gone. And they've stayed off ever since.",
            "That was nearly 9 years ago.",
            "Today, my body feels better than it ever has. My energy is through the roof. I teach back-to-back sessions, spend all day in the garden, and still feel great at the end of the night. My recovery between sessions is incredible.",
            "You can't put a price on that. I lost 10 pounds, and I feel incredible."
          ]
        },
        {
          ...getIsoblPartnerImage(2, "en"),
          name: "ISA 2 - Heather, Personal Trainer & Nutritionist",
          quote: "How a skeptical sports coach built a thriving business by sharing what actually worked for her clients.",
          paragraphs: [
            "I was always short of money. Always broke.",
            "I come from a family of worriers. I watched my mum struggle her whole life. That scared me. Then one day, my son Louis looked at me with the same worried expression I used to wear watching my mum.",
            "That hit hard.",
            "As a champion athlete, personal trainer, and nutritionist, I believe in whole foods. I didn't believe in supplements. I was sponsored as an athlete with products that did nothing for my health or performance.",
            "So when my great nieces brought me a new product, my first instinct was: absolutely not.",
            "But I trusted them. And I saw what happened when I started sharing the products with my clients.",
            "My personal training business boomed. Other trainers wanted to know what I was doing. Other gyms came asking.",
            "That was when I noticed my income and life could actually change.",
            "But the real turning point came when a client came to me in tears. She loved the products. She had amazing results. She felt in control of her health for the first time in years.",
            "Then her business went bust overnight. She lost everything. And the thing that broke her heart most? She couldn't afford the products anymore.",
            "That moment changed everything for me. I could have told her sooner that she could earn the products for free or build an extra income stream, so when disaster struck, she'd have had a safety net.",
            "This business gave me choice, flexibility, and the security I absolutely needed."
          ]
        },
        {
          ...getIsoblPartnerImage(3, "en"),
          name: "ISA 3 - Ilse & Tim, Sales Rep & Police Officer",
          quote: "A couple pulled apart by shift work built a business together - and got their life back.",
          paragraphs: [
            "Ilse: I was a full-time sales rep. By the time I got home, I was exhausted. And Tim was never there because he worked nights.",
            "Tim: I was always away from home. Ilse ate alone. She slept alone. If I wanted to see her, I'd look at a photo I kept in my bulletproof vest. I had all the recognition at my job. But being away from your wife all the time breaks your heart.",
            "Ilse: When we were introduced to the business two years ago, it was the first time we asked ourselves: maybe life doesn't have to be this way.",
            "Tim: I was skeptical. When something sounds too good to be true, it usually is. I thought I knew it all. Looking back, I was wrong. So we decided to be open. What are the possibilities? How could this change our lives?",
            "Ilse: We started while he still had night shifts. He'd prospect during the day while I was at my full-time job. On weekends, when he was pulling 12-hour shifts, I'd pick up where he left off. We truly helped each other, catching each other up on whatever needed to be done.",
            "Tim: We held each other accountable from day one. We decided: if we start this, we will make it work. Be consistent. Help each other. It's been beautiful watching each other grow. Before, life was pulling us apart. Now we work on our dreams together and share them with the world. Level up yourself. Be brave. Take an honest inventory of your life and see what's missing.",
            "Ilse: Give it a try. If it's for you, great. If not, that's okay too. But what if? Now we spend real time together. I don't eat alone anymore. We have dinner together. We travel together. I'm so grateful.",
            "Tim: When my father passed away six months ago, it changed how I view time and what I focus on. I was able to spend his last month with him. Care for him. Cry with him. Be there for him. I will cherish that forever. Without our business, that wouldn't have been possible. I am so grateful."
          ]
        },
        {
          ...getIsoblPartnerImage(4, "en"),
          name: "ISA 4 - Lara Eastwood, NHS Nurse",
          quote: "Made enough extra income to extend maternity leave from 5 months to 15 months.",
          paragraphs: [
            "I was working as an NHS nurse, 60 hours a week. Most of it was forced overtime because every shift was short-staffed.",
            "I'd used the products for years and loved them. They became part of my daily life. Then I had my little boy, Oliver. Everything changed.",
            "My maternity pay dropped. I started wondering how I could afford to stay home. I didn't want to go back early; I'd always planned to take the full year.",
            "I got talking to a couple of nurse friends who'd already built a solid income through the business. I thought: if they can do it, why can't I?",
            "That decision changed my whole life and my family's future.",
            "I knuckled down. Treated it like a business. Built a daily routine. And quickly started bringing in extra money. I was so grateful.",
            "I no longer had to go back to work when my son was five months old. I extended my maternity leave to fifteen months.",
            "That was literally priceless. I made the extra income I needed to stay home with my little boy."
          ]
        },
        {
          ...getIsoblPartnerImage(5, "en"),
          name: "ISA 5 - Lissa Asselbergs, Beauty Salon Owner",
          quote: "Added a product line that clients reorder on their own - and found better work-life balance.",
          paragraphs: [
            "My name is Lissa Asselbergs. I'm a salon owner, a mum, and a wife. Life was already busy before I added anything new.",
            "I'd had my salon for over eight years, working twelve-hour days. Maybe a little too much. When you work that many hours, you can lose your passion. That scared me.",
            "Ilse contacted me on Instagram. I was skeptical at first, but I said: \" Sure, come over, let's talk. \"",
            "She showed me the before-and-afters from the collection. I was blown away. The results spoke for themselves: skin, nails, hair, everything.",
            "And it's so easy. Clients love the products because they keep reordering on their own. That's been great for me.",
            "I also asked my parents to try them, because my clients see them every day in the salon. My parents both started at the same time, and their results after 30 days were amazing. Having their before-and-afters really expanded my business.",
            "Now I share it with other salon owners and colleagues. I want to shout from the rooftops about how good these products are and why they belong in every salon. It helped me find a better work-life balance."
          ]
        },
        {
          ...getIsoblPartnerImage(6, "en"),
          name: "ISA 6 - Saskia, Personal Trainer & Nutritionist",
          quote: "Transformed her body at 50 - then helped other women do the same.",
          paragraphs: [
            "I didn't sleep well. I didn't feel fit. Everyone assumes that because I'm a personal trainer, I must be in great shape. I looked fit. I wasn't.",
            "I was dealing with hot flashes and low energy. A client introduced me to the products, and my first thought was: no way.",
            "How could I tell my own clients I was using shakes? For years, I'd told them to eat their vegetables. Now I'm going to use shakes myself?",
            "So it took a long time before I tried them. But my own clients saw me changing. My body was transforming at the age of 50, three years ago.",
            "I feel great. And because they saw the change in me, they believed me when I said these products actually work.",
            "Now I help women with the products and with building their own businesses. I think it's so important to help other women do the same."
          ]
        },
        {
          ...getIsoblPartnerImage(7, "en"),
          name: "ISA 7 - Tinashe, Sales Professional with Health Background",
          quote: "Gained 3 kg of lean muscle after years of trying - and got his energy and confidence back.",
          paragraphs: [
            "I come from a healthcare background. I was working 60 hours a week. Burned out. Always tired, no matter how much I slept. Low mood. Unhappy with my life.",
            "I knew there was something better out there.",
            "I reached a point where I was sick of being tired. I knew I needed to change.",
            "I'd lost so much weight from stress. Dropped from 65 kg to 55 kg. I didn't like how I looked or felt.",
            "My goal was to build lean muscle. Before, it took me half a year to gain half a kilo. When I started on the products, I put on 3 kg. Something I'd never managed in my life.",
            "From that moment, everything shifted. I felt great about myself. My energy came back. My confidence came back. I started falling in love with who I was again. People started asking me what I was taking. I feel like I'm 50 years old again.",
            "Waking up every morning excited for the day, feeling vibrant, showing up as the best version of myself for the people around me - that's been incredible.",
            "It's a win-win. Either you get the results, or you get your money back. Take that small step. You never know what's on the other side. I gained 3 kg of lean muscle, and I feel amazing."
          ]
        },
        {
          ...getIsoblPartnerImage(8, "en"),
          name: "ISA 8 - Michael Bockaert, Gym Owner & Personal Trainer",
          quote: "Gave his gym clients better results - then built a second income stream from it.",
          paragraphs: [
            "I've been in the fitness industry for over 20 years, running a successful gym and coaching business.",
            "I was willing to put the products to the test and see what they could do. I quickly saw the difference in my clients. They had more energy. Their physiques improved. On competition day, they looked better, recovered faster, maintained lower body fat, and stayed in great shape long after the show.",
            "75% of results come from nutrition and just 25% from workouts. Getting the right nutrition matters more than anything. My clients saw significant weight loss and increased lean muscle. The systems work well, whatever your goal is.",
            "After seeing those results firsthand, I got interested in the business opportunity. I didn't have to invest a huge amount to get started. I just had to give it a try.",
            "I decided to go all in. And when I say all in, I mean all in. At first, I had no idea what I was doing. But I took action. Success in this business comes down to two things: taking action and being consistent. No start-stop. Be consistent year-round with whatever time you dedicate.",
            "Now people can see that this opportunity is real. Anyone can do this. Anything is possible. If I can do it, so can you."
          ]
        }
      ]}
      faq={[
        {
          question: "What is ISOBL?",
          answer: "ISOBL stands for Instant Success Online Business Launch. It helps practitioners build a digital extension of their existing practice. You receive a professional wellness hub under your name, a curated product selection, automated processes, and full logistics support."
        },
        {
          question: "Who is ISOBL for?",
          answer: "Practitioners in health, beauty, fitness, coaching, wellness, personal development, therapy, energy work, consulting, and related fields. It is well-suited for those who want to deepen client support, build long-term loyalty, or create more stable income without working more hours."
        },
        {
          question: "How does ISOBL work?",
          answer: "You extend your practice with a digital wellness channel. You receive an online hub featuring curated products, shipped directly by professional logistics partners. This lets you generate recurring revenue, attract new clients, and maintain meaningful ongoing relationships - without managing inventory or shipping yourself."
        },
        {
          question: "Does ISOBL work with or without a subscription model?",
          answer: "Yes, both. You can start by recommending products through your hub and letting recurring orders develop naturally. Or introduce a structured membership model from the start to create predictable monthly income and formalize long-term client support. We discuss both options during the Clarity Call."
        },
        {
          question: "Do I have to develop my own products or manage a store?",
          answer: "No. You receive a ready-to-use, professionally built hub system under your business name. All logistics - warehousing, packing, shipping, returns, and capital - are handled by our partners."
        },
        {
          question: "Do I need any technical experience?",
          answer: "No. ISOBL is designed so practitioners without a technical background can get started with confidence. Clear processes, personal support, and a ready-to-use system are included."
        },
        {
          question: "What products are offered?",
          answer: "The product selection is tailored to your practice and clients. The focus is on high-quality items in health, beauty, fitness, wellness, and lifestyle categories. Many are well-suited to recurring orders and membership models."
        },
        {
          question: "Can I combine ISOBL with my existing practice?",
          answer: "Yes. That's precisely what ISOBL was built for. The system complements your practice. Your existing client relationships, expertise, and local presence remain the foundation."
        },
        {
          question: "Is ISOBL suitable for local or clinic-based practices?",
          answer: "Yes. Practitioners with a physical location benefit from extending their reach digitally. ISOBL combines your local presence with online opportunities: broader visibility, digital availability, and additional income that works even when your treatment room is fully booked."
        },
        {
          question: "Can I sell internationally?",
          answer: "Yes. The system is international and can be used from anywhere."
        },
        {
          question: "How does ISOBL support client retention?",
          answer: "ISOBL combines your personalized approach with modern online systems. Clients stay engaged longer and return more consistently. Membership and subscription models foster ongoing relationships that mirror what you already offer in sessions."
        },
        {
          question: "How much does ISOBL cost?",
          answer: "The investment depends on the solution that makes the most sense for your practice. That's why the process begins with a paid Clarity Call. During that conversation, we analyze your practice, growth potential, and goals, and discuss which approach is right for you."
        },
        {
          question: "Why is the Clarity Call paid?",
          answer: "It's a genuine strategic analysis. We take the time to understand your practice properly - just as you would with a new client before recommending anything. The fee reflects the value of that professional time and ensures we both come prepared."
        },
        {
          question: "How does the application process work?",
          answer: "- You book your Clarity Call.\n- We analyze your practice and options together.\n- We honestly determine whether ISOBL is the right next step.\n- If so, you apply to join the program."
        },
        {
          question: "How quickly can I get started?",
          answer: "Many practitioners launch their wellness hub quickly. Speed depends on your practice, positioning, and implementation pace. You're supported throughout."
        },
        {
          question: "Is ISOBL a network marketing program?",
          answer: "ISOBL combines modern online business with B2B and B2C cross-marketing and membership systems. The focus is on meaningfully extending established practices through digital channels and build sustainable additional income. It's built for practitioners who want to grow professionally, not to recruit."
        },
        {
          question: "What makes ISOBL different?",
          answer: "ISOBL brings together personal practice, digital systems, recurring income potential, automated support, community, and modern client retention into one clear, actionable system. It's built for practitioners who want to extend their impact online while staying true to who they are and how they work."
        }
      ]}
      finalTitle="Growth Starts When You Stop Doing Everything Alone"
      finalText="ISOBL is a modern extension of your practice. With structure. With support. With real opportunities. It's for practitioners ready to grow consciously - while staying true to themselves and their clients."
    />
  );
}
