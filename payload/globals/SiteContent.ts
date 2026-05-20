import type {GlobalConfig} from "payload";

export const SiteContent: GlobalConfig = {
  slug: "site-content",
  fields: [
    {
      name: "ctaHeadline",
      type: "text",
      required: true,
    },
    {
      name: "ctaText",
      type: "textarea",
      required: true,
    },
    {
      name: "footerEmail",
      type: "email",
      required: true,
    },
    {
      name: "seoTitle",
      type: "text",
    },
    {
      name: "seoDescription",
      type: "textarea",
    },
  ],
};
