"use client";

import {usePathname} from "next/navigation";
import {AiChatWidget} from "@/components/ai-chat-widget";
import {getPublicAssistantContext} from "@/lib/ai/public-path";

export function GlobalAiAssistant() {
  const pathname = usePathname();
  const context = getPublicAssistantContext(pathname || "/");
  return context ? <AiChatWidget locale={context.locale} /> : null;
}
