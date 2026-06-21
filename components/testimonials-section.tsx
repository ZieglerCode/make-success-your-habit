"use client";

import {CaretDown} from "@phosphor-icons/react";
import {useState} from "react";

type SiteLang = "de" | "en";

type Testimonial = {
  name: string;
  role?: string;
  paragraphs: string[];
  bullets?: string[];
  afterBullets?: string[];
};

const testimonialImageSrcByName: Record<string, string> = {
  "Karin Schäfer":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-1b-Karin%20Schaefer.webp",
  "Tatjana Gürth":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-2b-Tatjana%20Guerth.webp",
  "Jörg Praetorius":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-3b-Joerg%20Praetorius.webp",
  "Oliver Künstler":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-4b-Oliver%20Kuenstler.webp",
  "Rosalinde Skowanek":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-5b-Rosalinde%20Skowanek.webp",
  "Ina Hantl": "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-6b-Ina%20Hantl.webp",
  "Esther Bischop":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-7b-Esther%20Bischop.webp",
  "Alexandra Brunner":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-8b-Alexandra%20Brunner.webp",
  "Alice Büchi":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-9b-Alice%20Buechi.webp",
  "Andrea Massmann":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-10b-Andrea%20Massmann.webp",
  "Eugenia Grabandt":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-11b-Eugenia%20Graband.webp",
  "Bärbel Müller-Reinhardt":
    "/media/images/msyh-testimonial-profile-pictures/webp/HZ%20MSYH-12b-Baerbel%20Mueller-Reinhardt.webp",
};

const testimonialContent: Record<
  SiteLang,
  {
    eyebrow: string;
    title: string;
    intro: string;
    featured: {name: string; paragraphs: string[]};
    items: Testimonial[];
    cta: string;
    primaryCta: string;
    secondaryCta: string;
    showMore: string;
    showLess: string;
  }
> = {
  de: {
    eyebrow: "Erfahrungen",
    title: "Stille Klarheit. Spürbare Veränderung.",
    intro:
      "Was Menschen nach der Arbeit mit Heike Ziegler berichten: mehr innere Ruhe, mehr Fokus, mehr Vertrauen in den eigenen Weg.",
    featured: {
      name: "Jörg Praetorius",
      paragraphs: [
        "Projekte, die monatelang feststeckten, gehen jetzt Schritt für Schritt voran.",
        "Hallo, mein Name ist Jörg Praetorius. Ich arbeite als Unternehmens- und Innovationsberater für die „Daniel Düsentriebs“ dieser Welt. Ich begleite Menschen, die viele Ideen haben, aber an der Umsetzung scheitern.",
        "Ehrlich gesagt: Das war auch genau mein Thema. Projekte standen kurz vor dem Abschluss, gerieten dann ins Stocken. Innerlich hat irgendetwas blockiert.",
        "Über Heike Ziegler habe ich die IC-Methode kennengelernt. Zunächst unverbindlich in kostenfreien Online-Sessions. Ich war neugierig. Und natürlich kritisch: Funktioniert das wirklich so schnell?",
        "Was mich überrascht hat: Bereits nach der ersten Anwendung habe ich innerlich etwas gespürt. Spürbar im Körper.",
        "Nach drei Sessions hatte ich das Gefühl, ein komplett neues Betriebssystem aufgespielt zu bekommen. Klarer. Stabiler. Ruhiger. Und vor allem: Ich bin ins Handeln gekommen.",
        "Entscheidungen fallen mir leichter. Ich bremse mich selbst nicht mehr aus. Und das Spannendste: Die Veränderung wirkt auch nach den Sessions weiter. Kein kurzfristiger Effekt, sondern etwas, das sich nachhaltig entwickelt.",
        "Wenn du viel Potenzial und viele Ideen hast, aber merkst, dass sich innerlich etwas zurückhält, kann ich dir die Arbeit von Heike Ziegler wirklich empfehlen.",
        "Für mich war das der entscheidende Schritt, um aus alten Mustern herauszukommen und endlich in die Umsetzung zu kommen.",
        "Danke dir, Heike, für deine klare Begleitung.",
      ],
    },
    items: [
      {
        name: "Tatjana Gürth",
        paragraphs: [
          "Ich hatte beruflich den Fokus verloren. Die innere Klarheit, die Gelassenheit, das Selbstvertrauen. Alles fühlte sich diffus an.",
          "Schon nach der ersten Anwendung konnte ich richtig durchatmen. Spürbare Erleichterung, sofort.",
          "In drei Sitzungen haben wir Themen bearbeitet, die mir zuvor gar nicht bewusst waren. Heike hat strukturiert und punktgenau die richtigen Fragen gestellt, meine eigenen Worte verwendet und exzellent zusammengefasst. Sie hat mich sicher durch den gesamten Prozess geführt.",
          "Das Ergebnis: Ich bin gelassen. Ich ruhe in mir. Egal, was auf mich zukommt, kann ich damit umgehen und meinen Fokus behalten. Themen, die mich jahrelang belastet haben, sind abgehakt.",
          "Gerade in diesen herausfordernden Zeiten wieder einen inneren Kompass zu haben, Visionen zu spüren und mit Sicherheit nach vorne zu schauen: Das ist unbezahlbar.",
          "Danke, Heike. Du hast mir genau das gegeben.",
        ],
      },
      {
        name: "Karin Schäfer",
        paragraphs: [
          "Vor meiner ersten IC-Anwendung bei Heike Ziegler litt ich unter Bluthochdruck, Schlafstörungen und Tinnitus. Ich war ständig angespannt, gestresst und energielos.",
          "Schon nach der ersten IC-Anwendung: besserer Blutdruck, besserer Schlaf, mehr Gelassenheit.",
          "Nach der zweiten und dritten Anwendung kamen hinzu: ein Gefühl von Sicherheit, Leichtigkeit und spürbar mehr Energie – und das anhaltend.",
          "Ich habe zuvor verschiedene Methoden ausprobiert. Keine hat so schnell und so direkt gewirkt wie diese.",
          "Was Heike besonders macht: Sie ist zugewandt, klar und liebevoll. Durch gezielte Fragen hat sie mir geholfen, meine eigenen Ziele wirklich zu verstehen. Während der Anwendungen entstand ein tiefes Gefühl von Dankbarkeit und Zuversicht.",
          "Ich empfehle aus vollem Herzen, sich von Heike eine Anwendung geben zu lassen.",
          "Herzlichen Dank, liebe Heike.",
        ],
      },
      {
        name: "Oliver Künstler",
        role: "Coach & Buchautor, Raum Heilbronn",
        paragraphs: [
          "Ich hatte gleich mehrere körperliche Baustellen: ein hartnäckiges Hautproblem an den Oberschenkeln, eine Dauererkältung seit Wochen und ein Knie, das sich nach einer Meniskus-OP wieder gemeldet hat. Dazu kam, dass meine Produktivität im Keller lag. Ich habe Dinge verschleppt, vor mir hergeschoben, nicht ins Handeln gefunden.",
          "Dann hat mir Heike Ziegler eine IC-Anwendung gegeben.",
          "Was mir sofort aufgefallen ist: Heike spricht so ruhig und klar, dass man sich voll und ganz auf den Prozess einlassen kann. Man kommt ins Vertrauen. Man gibt sich hin. Und genau das braucht es, damit eine solche Anwendung wirkt. Wir waren sofort auf einer Wellenlänge.",
          "Was danach passiert ist:",
        ],
        bullets: [
          "Das Knie hat sich beruhigt.",
          "Die Dauererkältung war weg.",
          "Der Hautausschlag ist in den folgenden Wochen deutlich zurückgegangen.",
          "Ich schiebe Dinge nicht mehr endlos vor mir her. Ich komme ins Tun.",
        ],
        afterBullets: [
          "Und dann gab es noch etwas, das ich gar nicht erwartet hatte: In meinem Umfeld sind plötzlich neue, vielversprechende Kontakte aufgetaucht. Menschen, bei denen allein die Energie ein besseres Gefühl erzeugt. Ein echtes Gefühl von Fortschritt.",
          "Das war kein Gegenstand der Anwendung und trotzdem ist es passiert.",
          "Vielen Dank, Heike. Von Herzen.",
        ],
      },
      {
        name: "Rosalinde Skowanek",
        paragraphs: [
          "Monatelang hatte ich Schmerzen in meiner rechten Hand – bis hoch in die Schulter. Dann kam ich zu Heike Ziegler und ihrer IC-Anwendung.",
          "Schon nach der ersten Sitzung spürte ich eine Leichtigkeit im Körper. Die Schmerzen begannen sich zu lösen.",
          "Nach der zweiten Anwendung waren die Schulterschmerzen und das Ziehen weg.",
          "Nach der dritten Anwendung konnte ich meine rechte Hand wieder richtig belasten. Schreiben, Haushalt, alles ging wieder.",
          "Heike führt den Prozess mit so viel Ruhe, Professionalität und Herzlichkeit. Ich kann sie von ganzem Herzen weiterempfehlen.",
          "Dass man mit dieser Methode auf körperlicher Ebene so viel erreichen kann, begeistert mich bis heute.",
          "Danke, Heike.",
        ],
      },
      {
        name: "Ina Hantl",
        paragraphs: [
          "Ich bin in Situationen mit richtig schwierigen Gesprächspartnern jetzt viel gelassener. Wir begegnen uns auf Augenhöhe und mit Vertrauen, und das wollen wir beide.",
          "Heike hat mir im Juni 2024 drei IC-Sitzungen gegeben. Meine Themen: Ahnenlinien, Kommunikation mit anderen Menschen, und die richtigen Partner finden: geschäftlich wie privat.",
          "Was mich beeindruckt hat: Heike hat meine Wünsche sehr einfühlsam aufgenommen und alles, was aus meiner Vergangenheit mitgeschwungen ist, präzise zusammengeführt.",
          "Die Ergebnisse spüre ich schon jetzt:",
        ],
        bullets: [
          "Kommunikation: Ich komme elegant durch schwierige Gespräche. Kein Kampf mehr.",
          "Ahnenlinien: Viel Frieden und Harmonie in meinem Inneren. Ich fühle mich angekommen, zufrieden und innerlich ruhig.",
          "Geschäftlich: Die richtigen Partnerinnen und Partner kommen jetzt auf mich zu. Von sich aus. Ich muss mich nicht mehr so anstrengen wie vorher.",
        ],
        afterBullets: [
          "Heike hat eine intuitive, einfühlsame Art. Ihre emotionale Intelligenz ist außergewöhnlich.",
          "Vielen Dank, liebe Heike.",
        ],
      },
      {
        name: "Esther Bischop",
        paragraphs: [
          "Mein Name ist Esther Bischop. Ich habe bei Heike Ziegeler eine IC-Anwendung gebucht.",
          "Mein Thema: Im Hier und Jetzt leben. Mut für einen Neubeginn finden. Und wieder voll auf meine Selbstheilung vertrauen.",
          "Zwei Monate zuvor hatte ich meine langjährige Freundin an Krebs verloren. Die Trauer saß tief.",
          "Was dann passiert ist: Heike hat mit präzisen Fragen blinde Flecken aufgedeckt, die ich allein nie gesehen hätte. Sie hat aus mir herausgekitzelt, was ich mir wirklich wünsche, um glücklich zu sein. Genau auf den Punkt.",
          "Ihre Worte haben etwas in mir ausgelöst. Nachhaltig.",
          "Bis heute fühle ich mich glücklich. Ich bin im Hier und Jetzt. Dankbar für mein Leben.",
          "Heike, ich kann dich nur weiterempfehlen. Du machst großartige Arbeit. Vielen Dank.",
        ],
      },
      {
        name: "Alexandra Brunner",
        paragraphs: [
          "Drei Sitzungen mit Heike und ich bin heute motivierter als je zuvor.",
          "Ich bin Alexandra. Ich kam zu Heike, weil ich mit meinem Business feststeckte. Dazu kamen familiäre Themen, die mich bremsten.",
          "Heike hat mit ihrer strukturierten Art und ihrem echten Einfühlungsvermögen Dinge in mir sichtbar gemacht, die mir selbst gar nicht bewusst waren. Sie hat mich dort gesehen, wohin ich will. Das hat so viel Freude in mir ausgelöst.",
          "Was mich besonders berührt hat: Heike nimmt deine eigenen Worte, verbindet sie mit ihren und plötzlich spürst du, was wirklich in dir steckt.",
          "Heute freue ich mich auf alles, was kommt.",
          "Egal, welche Herausforderung du gerade hast: Heike hilft dir weiter.",
          "Danke, liebe Heike. Von Herzen.",
        ],
      },
      {
        name: "Alice Büchi",
        paragraphs: [
          "Mehr Klarheit, mehr Stabilität, mehr Vertrauen in mich selbst: Das hat sich nach nur drei Anwendungen mit Heike Ziegler verändert.",
          "Ich war an einem Punkt, an dem ich spürte: Etwas muss sich ändern. Ich brauchte Klarheit. Nach langem Suchen bin ich auf ICM und Heike gestoßen.",
          "Heike hat mich ruhig und einfühlsam durch die drei Anwendungen geführt. Was mich überrascht hat: Ihre Worte waren unglaublich treffend. Und die Programme, die sie intuitiv ausgewählt hatte, passten genau.",
          "Zwei Wochen nach der letzten Anwendung kann ich sagen: Da haben sich neue Türen geöffnet.",
        ],
        bullets: [
          "Ich spüre viel mehr Stabilität und Klarheit",
          "Ich bin ruhiger geworden",
          "Ich habe mehr Vertrauen in mich selbst",
          "Ich gehe meinen Weg jetzt mit einer ganz neuen inneren Ruhe",
        ],
        afterBullets: [
          "Liebe Heike, danke für deine Herzlichkeit und dein Einfühlungsvermögen. Diese Erfahrung macht mich einfach happy.",
          "Ich kann ICM nur weiterempfehlen. Macht es. Es lohnt sich.",
        ],
      },
      {
        name: "Andrea Massmann",
        paragraphs: [
          "Ich konnte vor finanzieller Angst kaum atmen. Nach drei Anwendungen fühlte ich mich königlich.",
          "Ich steckte in einem finanziellen Engpass, der mir fast die Luft nahm. Die Brust war zu. Die Atmung funktionierte nicht. Alte Gedanken und Gefühle haben mich regelrecht handlungsunfähig gemacht.",
          "Ich konnte mir nicht vorstellen, dass es jemals anders sein würde. Fülle, Reichtum, groß denken: Das kam in meinem Fühlen überhaupt nicht vor.",
          "Schon nach der ersten Anwendung mit Heike fühlte ich mich leicht. Voller Vertrauen. In mir war eine spürbare Gewissheit: Die Lösung liegt mir bereits bereit.",
          "Nach der zweiten Anwendung wurde das Gefühl stärker. Ich fühlte mich reich gesegnet. Königlich. Als hätte ich einen goldenen Mantel um mich.",
          "Heike hat mein tiefes Mangel- und Armutsbewusstsein sofort erkannt. Sie hat gezielt tiefe Fragen gestellt, klar und zugewandt. Sobald ich in Mangelformulierungen geraten war, hat sie sofort umgelenkt. Und das Schöne daran: Ich konnte es annehmen und nachempfinden.",
          "Zwischendurch kamen alte Glaubenssätze hoch, die ganz tief verborgen waren. Das hat mich kurz lahmgelegt. Aber ich habe es selbst geschafft, das Blatt zu wenden. Das war eine fantastische Erfahrung: Ich habe es in der Hand. Ich kann mich von alten Mustern abwenden und ins neue Denken hineingehen.",
          "Nach der dritten Anwendung kam Klarheit. Mein Verstand wurde still. Und er hat eine neue Aufgabe bekommen: kreativ zu handeln, statt mich zu blockieren.",
          "Was bis heute bleibt: Das Gefühl von Fülle. Die Offenheit gegenüber Reichtum und Wohlstand. Mein Fokus ist absolut auf Erfolg gerichtet – auch finanziell. Der steht mir zu. Der darf sein.",
          "Liebe Heike, ganz großen Dank. Das war eine intensive und so wertvolle Zusammenarbeit.",
        ],
      },
      {
        name: "Eugenia Grabandt",
        paragraphs: [
          "Ich stehe seit zwei Wochen morgens um halb fünf auf: ausgeschlafen, mit einem Lächeln im Gesicht, voller Energie und Freude. Vorher? Keine Chance. Nach dem Urlaub war die Motivation komplett weg.",
          "Dann bekam ich drei IC-Behandlungen von Heike Ziegler.",
          "Heike hörte mir genau zu. Sie stellte die richtigen Fragen, sodass ich meinen Wunsch und mein Ziel klar formulieren konnte. Dann suchte sie die passenden Worte und Programme für mich aus.",
          "Schon während der Behandlung spürte ich, wie sich mein Körper aufrichtete. Wie Energie durch mich floss. Wie meine Motivation stieg. Ein Lächeln, eine Leichtigkeit, eine Freude von innen heraus.",
          "Und das Beste: Es hält an.",
          "Jeden Morgen starte ich jetzt mit Gymnastik und meiner Morgenroutine. Diese Energie zieht sich durch den ganzen Tag. In Situationen, die mich früher gestresst hätten, sehe ich jetzt das Positive. Weil dieses Positive in mir ist.",
          "Wie viel Lebensqualität dieses erholsame Aufwachen einem schenkt, lässt sich kaum in Worte fassen.",
          "Heike hört zu. Sie packt alles persönlich für einen zusammen. Und sie verändert schnell etwas. Man braucht keine langen Sitzungen, kein stundenlanges Reden. Eine kurze Behandlung und die Lebensqualität kehrt zurück.",
          "Wer sich eine tiefe, schnelle und bleibende Veränderung wünscht, ist bei Heike genau richtig.",
          "Danke, Heike, für dieses Lebensgefühl.",
        ],
      },
      {
        name: "Bärbel Müller-Reinhardt",
        paragraphs: [
          "„Geld kam zu mir, blieb aber nie. Nach drei Anwendungen mit Heike hat sich das aufgelöst.“",
          "Ich hatte ein Muster: Geld kam rein, Geld ging raus. Es wurde immer wieder knapp. Ich wollte das ändern.",
          "Schon nach der ersten IC-Anwendung spürte ich eine tiefe Entspannung. Da merkte ich erst, wie lange mich dieses Thema wirklich belastet hatte.",
          "Dann kamen alte Überzeugungen hoch. „Es geht eher ein Kamel durch ein Nadelöhr, als dass ein Reicher in den Himmel kommt.“ Plötzlich war da eine tiefe Angst vor Reichtum. Und gleichzeitig eine Angst vor Armut.",
          "In den nächsten zwei Anwendungen sind wir genau da reingegangen. Schicht für Schicht. Erinnerungen an meine Kindheit tauchten auf: an die Art, wie in meiner Familie mit Geld umgegangen wurde. Das zog sich durch Generationen.",
          "Heute habe ich das Gefühl: Das ist aufgelöst. Für mich, für die Vergangenheit, für meine Kinder.",
          "Ich fühle mich frei davon.",
          "Heike, danke von Herzen für diese Begleitung. Ich bin mir sicher, dass dieses Thema jetzt gelöst ist.",
        ],
      },
    ],
    cta: "Du willst echte innere Klarheit und nachhaltige Veränderung? Dann mach jetzt den nächsten Schritt.",
    primaryCta: "Termin anfragen",
    secondaryCta: "So funktioniert die Zusammenarbeit",
    showMore: "Ganzes Testimonial lesen",
    showLess: "Weniger anzeigen",
  },
  en: {
    eyebrow: "Experiences",
    title: "Quiet clarity. Tangible change.",
    intro:
      "What people report after working with Heike Ziegler: more inner calm, more focus and more trust in their own path.",
    featured: {
      name: "Jörg Praetorius",
      paragraphs: [
        "Projects that were stuck for months are now moving forward step by step.",
        "Hello, my name is Jörg Praetorius. I work as a business and innovation consultant for the “Daniel Düsentrieb” of this world. I support people who have lots of ideas but struggle to bring them to life.",
        "To be honest, that was exactly my issue. Projects were on the verge of completion, then stalled. Something inside me was blocking progress.",
        "I learned about the IC Method through Heike Ziegler. At first, it was through free online sessions with no obligation. I was curious. And, of course, skeptical: Does it really work that fast?",
        "What surprised me: Even after the first session, I felt something inside. I could feel it in my body.",
        "After three sessions, I felt like I’d been given a completely new operating system. Clearer. More stable. Calmer. And above all, I started taking action.",
        "Making decisions comes more easily to me. I no longer hold myself back. And the most exciting part: the change continues to take effect even after the sessions. It’s not a short-term effect, but something that develops over the long term.",
        "If you have a lot of potential and many ideas but feel that something inside is holding you back, I can really recommend Heike Ziegler’s work.",
        "For me, this was the decisive step toward breaking out of old patterns and finally acting.",
        "Thank you, Heike, for your clear guidance.",
      ],
    },
    items: [
      {
        name: "Tatjana Gürth",
        paragraphs: [
          "I had lost my professional focus. My inner clarity, my serenity, my self-confidence. Everything felt vague.",
          "Even after the first session, I could finally breathe deeply. I felt immediate relief.",
          "In three sessions, we worked through issues I hadn’t even been aware of before. Heike asked the right questions in a structured and precise manner, used my own words, and summarized them excellently. She guided me safely through the entire process.",
          "The result: I am at peace. I am at ease within myself. No matter what comes my way, I can handle it and stay focused. Issues that have weighed on me for years are now behind me.",
          "Especially in these challenging times, having an inner compass again, sensing visions, and looking ahead with confidence: That is priceless.",
          "Thank you, Heike. You gave me exactly that.",
        ],
      },
      {
        name: "Karin Schäfer",
        paragraphs: [
          "Before my first IC treatment with Heike Ziegler, I suffered from high blood pressure, sleep disorders, and tinnitus. I was constantly tense, stressed, and lacking energy.",
          "Already after the first IC session: better blood pressure, better sleep, more serenity.",
          "After the second and third sessions, I also experienced a sense of security, lightness, and noticeably more energy—and these effects have lasted.",
          "I had tried various methods before. None worked as quickly or as directly as this one.",
          "What makes Heike special is that she is attentive, clear, and loving. Through targeted questions, she helped me truly understand my own goals. During the sessions, a deep sense of gratitude and confidence emerged.",
          "I wholeheartedly recommend having a session with Heike.",
          "Thank you so much, dear Heike.",
        ],
      },
      {
        name: "Oliver Künstler",
        role: "Coach & Author, Heilbronn Area",
        paragraphs: [
          "I had several physical issues at once: a persistent skin problem on my thighs, a cold that had been lingering for weeks, and a knee that had flared up again after meniscus surgery. On top of that, my productivity was at rock bottom. I was procrastinating, putting things off, and unable to act.",
          "Then Heike Ziegler gave me an IC treatment.",
          "What struck me immediately was that Heike speaks so calmly and clearly that you can fully immerse yourself in the process. You feel at ease. You let go. And that’s exactly what’s needed for a treatment like this to work. We were on the same page right away.",
          "What happened afterward:",
        ],
        bullets: [
          "My knee calmed down.",
          "The persistent cold was gone.",
          "The rash subsided significantly in the following weeks.",
          "I no longer put things off endlessly. I get things done.",
        ],
        afterBullets: [
          "And then there was something else I hadn’t expected at all: Suddenly, new, promising connections had appeared in my circle. People whose energy alone creates a better feeling. A real sense of progress.",
          "That wasn’t part of the treatment, and yet it happened.",
          "Thank you so much, Heike. From the bottom of my heart.",
        ],
      },
      {
        name: "Rosalinde Skowanek",
        paragraphs: [
          "For months, I had pain in my right hand—all the way up to my shoulder. Then I came to Heike Ziegler and her IC treatment.",
          "After just the first session, I felt a lightness in my body. The pain began to subside.",
          "After the second treatment, the shoulder pain and the pulling sensation were gone.",
          "After the third session, I could use my right hand normally again. Writing, housework—everything was back to normal.",
          "Heike guides the process with such calmness, professionalism, and warmth. I can wholeheartedly recommend her.",
          "The fact that this method can achieve so much on a physical level still amazes me to this day.",
          "Thank you, Heike.",
        ],
      },
      {
        name: "Ina Hantl",
        paragraphs: [
          "I’m much more relaxed now when dealing with difficult people. We meet on equal footing and with trust, and that’s what we both want.",
          "Heike gave me three IC sessions in June 2024. My topics: ancestral lines, communication with others, and finding the right partners—both in business and in my personal life.",
          "What impressed me: Heike listened to my wishes with great empathy and precisely brought together everything that carried over from my past.",
          "I can already feel the results:",
        ],
        bullets: [
          "Communication: I navigate difficult conversations with ease. No more struggle.",
          "Ancestral lines: A great deal of peace and harmony within me. I feel grounded, content, and at peace.",
          "Business: The right partners are now approaching me. On their own initiative. I no longer must try as hard as I did before.",
        ],
        afterBullets: [
          "Heike has an intuitive, empathetic manner. Her emotional intelligence is extraordinary.",
          "Thank you so much, dear Heike.",
        ],
      },
      {
        name: "Esther Bischop",
        paragraphs: [
          "My name is Esther Bischop. I booked an IC session with Heike Ziegeler.",
          "My focus: Living in the here and now. Finding the courage for a fresh start. And trusting fully in my self-healing abilities once again.",
          "Two months earlier, I had lost my longtime friend to cancer. The grief ran deep.",
          "What happened next: With precise questions, Heike uncovered blind spots that I would never have seen on my own. She coaxed out of me what I truly desire to be happy. Right on the mark.",
          "Her words triggered something in me. Something lasting.",
          "To this day, I feel happy. I am in the here and now. Grateful for my life.",
          "Heike, I can’t recommend you highly enough. You do amazing work. Thank you so much.",
        ],
      },
      {
        name: "Alexandra Brunner",
        paragraphs: [
          "Three sessions with Heike and I’m more motivated today than ever before.",
          "I’m Alexandra. I came to Heike because I was stuck with my business. On top of that, there were family issues holding me back.",
          "With her structured approach and genuine empathy, Heike helped me see things within myself that I wasn’t even aware of. She saw me exactly where I wanted to be. That brought me so much joy.",
          "What really touched me: Heike takes your own words, combines them with hers, and suddenly you feel what’s truly inside you.",
          "Today, I look forward to everything that lies ahead.",
          "No matter what challenge you’re facing right now, Heike will help you through it.",
          "Thank you, dear Heike. From the bottom of my heart.",
        ],
      },
      {
        name: "Alice Büchi",
        paragraphs: [
          "More clarity, more stability, more self-confidence: That’s what changed after just three sessions with Heike Ziegler.",
          "I had reached a point where I felt that something had to change. I needed clarity. After a long search, I came across ICM and Heike.",
          "Heike guided me calmly and empathetically through the three sessions. What surprised me was that her words were incredibly accurate. And the programs she intuitively selected were a perfect fit.",
          "Two weeks after the last session, I can say: New doors have opened.",
        ],
        bullets: [
          "I feel much more stable and clear-headed",
          "I have become calmer",
          "I have more confidence in myself",
          "I am now walking my path with a whole new inner peace",
        ],
        afterBullets: [
          "Dear Heike, thank you for your warmth and empathy. This experience simply makes me happy.",
          "I highly recommend ICM. Do it. It’s worth it.",
        ],
      },
      {
        name: "Andrea Massmann",
        paragraphs: [
          "I could barely breathe because of financial anxiety. After three sessions, I felt like royalty.",
          "I was stuck in a financial crisis that was suffocating me. My chest felt tight. I couldn’t breathe. Old thoughts and feelings had completely paralyzed me.",
          "I couldn’t imagine that things would ever be any different. Abundance, wealth, thinking big: those concepts didn’t even exist in my emotional world.",
          "After just the first session with Heike, I felt light. Full of confidence. I had a palpable certainty within me: the solution was already there for me.",
          "After the second session, the feeling grew stronger. I felt richly blessed. Royal. As if I were wrapped in a golden cloak.",
          "Heike immediately recognized my deep sense of lack and poverty. She asked specific, probing questions, clearly and with genuine care. As soon as I started using the language of lack, she redirected me immediately. And the beautiful thing about it is that I was able to accept and relate to it.",
          "In between, old beliefs surfaced that had been hidden very deeply. That briefly paralyzed me. But I managed to turn the tide on my own. It was a fantastic experience: I’m in control. I can turn away from old patterns and step into a new way of thinking.",
          "After the third session, clarity set in. My mind went quiet. And it was given a new task: to act creatively rather than block me.",
          "What remains to this day: a sense of abundance. An openness to wealth and prosperity. My focus is entirely on success—including financial success. I deserve it. It’s okay to have it.",
          "Dear Heike, thank you so much. That was an intense and incredibly valuable collaboration.",
        ],
      },
      {
        name: "Eugenia Grabandt",
        paragraphs: [
          "For the past two weeks, I’ve been getting up at 4:30 a.m.: well-rested, with a smile on my face, full of energy and joy. Before? No way. After my vacation, my motivation was completely gone.",
          "Then I received three IC treatments from Heike Ziegler.",
          "Heike listened to me carefully. She asked the right questions so that I could clearly articulate my wish and my goal. Then she selected the right words and programs for me.",
          "Even during the treatment, I felt my body straightening up. I felt energy flowing through me. I felt my motivation rising. A smile, a lightness, a joy coming from within.",
          "And the best part: it lasts.",
          "Every morning, I now start with exercises and my morning routine. This energy carries me through the whole day. In situations that would have stressed me out before, I now see the positive. Because that positivity is within me.",
          "It’s hard to put into words just how much this restorative way of waking up enhances your quality of life.",
          "Heike listens. She tailors everything personally to you. And she brings about change quickly. You don’t need long sessions or hours of talking. A short treatment, and your quality of life returns.",
          "If you’re looking for a deep, fast, and lasting change, Heike is exactly the right person for you.",
          "Thank you, Heike, for this sense of well-being.",
        ],
      },
      {
        name: "Bärbel Müller-Reinhardt",
        paragraphs: [
          "“Money came to me, but it never stayed. After three sessions with Heike, that changed.”",
          "I had a pattern: money came in, money went out. I was always running low. I wanted to change that.",
          "Even after the first IC session, I felt a deep sense of relaxation. That’s when I realized just how long this issue had really been weighing on me.",
          "Then old beliefs surfaced. “It is easier for a camel to go through the eye of a needle than for a rich person to enter the kingdom of heaven.” Suddenly, there was a deep fear of wealth. And at the same time, a fear of poverty.",
          "In the next two sessions, we delved right into that. Layer by layer. Memories of my childhood surfaced: of the way money was handled in my family. It ran through generations.",
          "Today I feel: That’s resolved. For me, for the past, for my children.",
          "I feel free from it.",
          "Heike, thank you from the bottom of my heart for this support. I am certain that this issue is now resolved.",
        ],
      },
    ],
    cta: "Do you want genuine inner clarity and sustainable change? Take the next step now.",
    primaryCta: "Request an appointment",
    secondaryCta: "How working together works",
    showMore: "Read full testimonial",
    showLess: "Show less",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function TestimonialPortrait({
  name,
  lang,
  featured = false,
}: {
  name: string;
  lang: SiteLang;
  featured?: boolean;
}) {
  const imageSrc = testimonialImageSrcByName[name];
  const label = `${lang === "de" ? "Porträt von" : "Portrait of"} ${name}`;

  if (!imageSrc) {
    return (
      <span
        aria-label={label}
        className={
          featured
            ? "grid aspect-square w-[clamp(120px,20vw,200px)] shrink-0 place-items-center rounded-xl bg-[#f2e2ce]"
            : "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#f2e2ce] font-serif text-sm font-semibold text-[#b08d6e]"
        }
        role="img"
      >
        <span className={featured ? "font-serif text-5xl font-semibold text-[#b08d6e]" : ""}>
          {initials(name)}
        </span>
      </span>
    );
  }

  return (
    <img
      alt={label}
      className={
        featured
          ? "aspect-square w-[clamp(120px,20vw,200px)] shrink-0 rounded-xl object-cover"
          : "h-[52px] w-[52px] shrink-0 rounded-full object-cover"
      }
      decoding="async"
      height={480}
      loading="lazy"
      src={imageSrc}
      width={480}
    />
  );
}

function TestimonialBody({
  testimonial,
  expanded,
}: {
  testimonial: Testimonial;
  expanded: boolean;
}) {
  const paragraphs = expanded ? testimonial.paragraphs : testimonial.paragraphs.slice(0, 1);

  return (
    <div className="space-y-3 text-[15px] leading-[1.7] text-[#444]">
      {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {expanded && testimonial.bullets?.length ? (
        <ul className="list-disc space-y-2 pl-5 marker:text-[#b08d6e]">
          {testimonial.bullets.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
      {expanded ? testimonial.afterBullets?.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}
    </div>
  );
}

export function TestimonialsSection({lang}: {lang: SiteLang}) {
  const content = testimonialContent[lang];
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<string>>(new Set());
  const [featuredExpanded, setFeaturedExpanded] = useState(false);
  const appointmentUrl = "https://cal.com/heikeziegler/book-your-first-instant-success-formula-session";

  function toggleTestimonial(name: string) {
    setExpandedTestimonials((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <section className="relative bg-[#faf9f7] px-6 py-20 text-[#2c2c2c]" id="community">
      <span className="absolute -top-24" id="testimonials" />
      <div className="mx-auto max-w-[1200px]">
        <header className="mx-auto mb-[60px] max-w-[680px] text-center">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[2.5px] text-[#b08d6e]">
            {content.eyebrow}
          </p>
          <h2 className="mb-4 font-serif text-[clamp(28px,4vw,42px)] font-bold leading-[1.25] text-[#1a1a1a]">
            {content.title}
          </h2>
          <p className="m-0 text-[17px] leading-[1.7] text-[#5a5a5a]">{content.intro}</p>
        </header>

        <article className="mb-10 flex flex-wrap items-center gap-10 rounded-2xl bg-white p-7 shadow-[0_2px_20px_rgba(0,0,0,0.05)] sm:p-10">
          <TestimonialPortrait featured lang={lang} name={content.featured.name} />
          <div className="min-w-[min(260px,100%)] flex-1">
            {(featuredExpanded ? content.featured.paragraphs : content.featured.paragraphs.slice(0, 2)).map((paragraph) => (
              <p className="mb-3.5 text-[17px] leading-[1.75] text-[#333] last:mb-5" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <p className="m-0 text-[15px] font-semibold text-[#1a1a1a]">{content.featured.name}</p>
            <button
              aria-expanded={featuredExpanded}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b08d6e] transition-colors hover:text-[#967456]"
              onClick={() => setFeaturedExpanded((current) => !current)}
              type="button"
            >
              {featuredExpanded ? content.showLess : content.showMore}
              <CaretDown
                aria-hidden
                className={`transition-transform duration-300 ${featuredExpanded ? "rotate-180" : ""}`}
                size={16}
              />
            </button>
          </div>
        </article>

        <div className="mb-[60px] grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
          {content.items.map((testimonial) => {
            const expanded = expandedTestimonials.has(testimonial.name);
            return (
              <article
                className="flex flex-col gap-4 rounded-xl bg-white p-7 shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
                key={testimonial.name}
              >
                <div className="flex items-center gap-3.5">
                  <TestimonialPortrait lang={lang} name={testimonial.name} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{testimonial.name}</p>
                    {testimonial.role ? (
                      <p className="mt-0.5 text-[13px] font-normal leading-5 text-[#777]">{testimonial.role}</p>
                    ) : null}
                  </div>
                </div>
                <TestimonialBody expanded={expanded} testimonial={testimonial} />
                <button
                  aria-expanded={expanded}
                  className="mt-auto inline-flex items-center gap-2 self-start pt-1 text-sm font-semibold text-[#b08d6e] transition-colors hover:text-[#967456]"
                  onClick={() => toggleTestimonial(testimonial.name)}
                  type="button"
                >
                  {expanded ? content.showLess : content.showMore}
                  <CaretDown
                    aria-hidden
                    className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                    size={16}
                  />
                </button>
              </article>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
          <p className="mx-auto mb-7 max-w-[520px] text-lg leading-[1.6] text-[#333]">{content.cta}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              className="inline-block rounded-lg bg-[#b08d6e] px-8 py-3.5 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[#967456]"
              href={appointmentUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {content.primaryCta}
            </a>
            <a
              className="inline-block rounded-lg border-2 border-[#b08d6e] bg-transparent px-8 py-3 text-[15px] font-semibold text-[#b08d6e] no-underline transition-colors hover:bg-[#b08d6e] hover:text-white"
              href="#methode"
            >
              {content.secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
