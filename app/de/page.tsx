import {HomePageContent} from "@/app/page";

export const dynamic = "force-dynamic";

export default async function GermanHomePage() {
  return <HomePageContent initialLang="de" />;
}
