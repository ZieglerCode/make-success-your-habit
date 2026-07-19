import type {CollectionConfig} from "payload";
import {payloadMediaDirectory} from "../../lib/upload-paths";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "filename",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    staticDir: payloadMediaDirectory(),
  },
};
