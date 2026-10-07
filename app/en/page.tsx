import {HomePageContent} from "@/components/home-page-content";

export const dynamic = "force-dynamic";

export default async function EnglishHomePage() {
  return <HomePageContent initialLang="en" />;
}
