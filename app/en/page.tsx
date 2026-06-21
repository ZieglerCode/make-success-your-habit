import {HomePageContent} from "@/app/page";

export const dynamic = "force-dynamic";

export default async function EnglishHomePage() {
  return <HomePageContent initialLang="en" />;
}
