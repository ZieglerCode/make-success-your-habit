import {postgresAdapter} from "@payloadcms/db-postgres";
import {lexicalEditor} from "@payloadcms/richtext-lexical";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {buildConfig} from "payload";
import sharp from "sharp";

import {Media} from "./payload/collections/Media";
import {Posts} from "./payload/collections/Posts";
import {Users} from "./payload/collections/Users";
import {SiteContent} from "./payload/globals/SiteContent";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " | Make Success Your Habit CMS",
    },
  },
  collections: [Users, Posts, Media],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    schemaName: process.env.PAYLOAD_DATABASE_SCHEMA || "payload",
  }),
  editor: lexicalEditor(),
  globals: [SiteContent],
  routes: {
    admin: "/payload-admin",
    api: "/payload-api",
    graphQL: "/payload-graphql",
    graphQLPlayground: "/payload-graphql-playground",
  },
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
