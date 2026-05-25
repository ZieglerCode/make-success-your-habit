import type {CollectionConfig} from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    read: () => true,
  },
  admin: {
    defaultColumns: ["title", "status", "publishedAt", "updatedAt"],
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "coverAlt",
      type: "text",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: ["draft", "review", "scheduled", "published", "archived"],
      required: true,
    },
    {
      name: "publishedAt",
      type: "date",
    },
    {
      name: "scheduledAt",
      type: "date",
    },
    {
      name: "seoTitle",
      type: "text",
    },
    {
      name: "seoDescription",
      type: "textarea",
    },
    {
      name: "authorName",
      type: "text",
      defaultValue: "Heike Ziegler",
    },
    {
      name: "category",
      type: "text",
    },
    {
      name: "tags",
      type: "text",
    },
    {
      name: "readingMinutes",
      type: "number",
      defaultValue: 1,
      min: 1,
    },
  ],
  timestamps: true,
};
