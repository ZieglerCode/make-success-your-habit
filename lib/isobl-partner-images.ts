export const ISOBL_PARTNER_IMAGES = {
  1: {
    src: "/media/images/isoble-experience-pictures/webp/isa-1-angela-hancock.webp",
    alt: {de: "Porträt von Angela H.", en: "Portrait of Angela Hancock"},
  },
  2: {
    src: "/media/images/isoble-experience-pictures/webp/isa-2-heather.webp",
    alt: {de: "Porträt von Heather", en: "Portrait of Heather"},
  },
  3: {
    src: "/media/images/isoble-experience-pictures/webp/isa-3-ilse-and-tim.webp",
    alt: {de: "Porträt von Ilse und Tim", en: "Portrait of Ilse and Tim"},
  },
  4: {
    src: "/media/images/isoble-experience-pictures/webp/isa-4-lara-eastwood.webp",
    alt: {de: "Porträt von Lara E.", en: "Portrait of Lara Eastwood"},
  },
  5: {
    src: "/media/images/isoble-experience-pictures/webp/isa-5-lissa-asselbergs.webp",
    alt: {de: "Porträt von Lissa A.", en: "Portrait of Lissa Asselbergs"},
  },
  6: {
    src: "/media/images/isoble-experience-pictures/webp/isa-6-saskia.webp",
    alt: {de: "Porträt von Saskia", en: "Portrait of Saskia"},
  },
  7: {
    src: "/media/images/isoble-experience-pictures/webp/isa-7-tinashe.webp",
    alt: {de: "Porträt von Tinashe", en: "Portrait of Tinashe"},
  },
  8: {
    src: "/media/images/isoble-experience-pictures/webp/isa-8-michael-bockaert.webp",
    alt: {de: "Porträt von Michael B.", en: "Portrait of Michael Bockaert"},
  },
} as const;

export type IsoblPartnerId = keyof typeof ISOBL_PARTNER_IMAGES;
type IsoblPageLanguage = keyof (typeof ISOBL_PARTNER_IMAGES)[IsoblPartnerId]["alt"];

export function getIsoblPartnerImage(
  id: IsoblPartnerId,
  language: IsoblPageLanguage,
) {
  const image = ISOBL_PARTNER_IMAGES[id];

  return {
    imageSrc: image.src,
    imageAlt: image.alt[language],
  };
}
