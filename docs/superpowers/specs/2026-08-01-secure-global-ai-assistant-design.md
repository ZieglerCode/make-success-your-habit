# Secure Global Website Assistant — Design

**Date:** 2026-08-01  
**Status:** Approved for local implementation  
**Scope:** All public German and English pages; no admin, Payload, or API pages

## Goal

Update the website assistant so it is available throughout the public website, answers from a complete bilingual website knowledge base, and offers safe navigation buttons for relevant destinations such as ISOBL and contact information. The assistant must remain useful when the model is unavailable or usage limits are reached, and it must fail closed against prompt injection, unsafe output, and uncontrolled cost.

The only public contact email is `contact@heike-ziegler.com`. Other public email addresses are replaced. Internal admin login identities and repository-only examples are not public website contact details and must not be changed automatically.

## User experience

- A single floating assistant is mounted globally on every public page.
- It detects the active `/de` or `/en` locale and answers in that language.
- It is absent from `/admin`, `/payload-admin`, Payload/API routes, and other non-public surfaces.
- For clear website intents such as ISOBL or contact, a deterministic local answer is returned without calling the model.
- Relevant replies can contain one prominent navigation button. Navigation happens only after the visitor clicks it.
- Destinations always keep the active locale.
- When the model, budget, or rate limit is unavailable, the visitor receives a useful local fallback and a safe contact option.

## Knowledge base

The knowledge base is a checked, server-owned representation of all public website content:

- homepage and brand positioning;
- method, About Heike, and community pages;
- Instant Success Formula, ISOBL, and ISA Alliance;
- published blog index and published article content;
- public contact and booking information;
- public legal pages, marked as exact-reference content rather than legal advice.

Content is split by locale, source page, section, topic, and approved destination. Each entry retains its source path so the assistant can offer the matching navigation button. The assistant receives only the few sections relevant to the current question, not the full website on every request. This lowers cost, keeps the context focused, and makes prompt injection harder.

The knowledge base is treated as trusted application data. Visitor text is never merged into it and can never alter it. Tests verify that every configured public route has knowledge coverage, every destination is allowed, and no obsolete public email remains.

## Navigation boundary

The model never creates or controls a URL. It may only propose a destination identifier from a fixed enum such as:

- `home`
- `method`
- `about`
- `community`
- `blog`
- `isf`
- `isobl`
- `isa`
- `contact`
- approved legal destinations
- `none`

The server validates the response structure. The browser maps the validated identifier to a hard-coded localized internal path. Arbitrary links, external links, HTML, scripts, redirects, and model-generated URLs are discarded. Booking destinations already approved by the website may be exposed only through separate server-owned identifiers and mappings.

## Prompt-injection and abuse controls

All visitor input is untrusted. The assistant has no browsing, code execution, database mutation, file access, external tools, or general function-calling ability.

Controls are layered:

1. Strict request validation limits message count, individual length, total length, accepted roles, and payload type.
2. Audio input is disabled for this initial hardened version because it increases cost and abuse surface.
3. Common navigation and contact intents are handled deterministically without the model.
4. Only locally retrieved website excerpts are supplied as knowledge.
5. The system instruction rejects attempts to reveal or replace instructions, change identity, exfiltrate secrets, invent facts, or act outside the website-assistant role.
6. Gemini safety filters are configured explicitly for the website's narrow advisory scope.
7. The model must return structured data with a short answer and one allow-listed destination identifier.
8. The server validates the structure and semantics. Invalid, malformed, unsafe, or oversized output is replaced by a safe local fallback.
9. The client renders plain text and controlled buttons only. It does not render model-supplied HTML or links.
10. No automatic retries are made, and each accepted visitor request can trigger at most one model call.

No single prompt can bypass a server-enforced allowlist, output validator, or usage counter. This is the hard security boundary; prompt wording is an additional layer, not the boundary itself.

## Cost controls

The user-approved provider budget is **5 EUR per month**. Because provider billing cutoffs may not be instantaneous, the application stops substantially earlier through conservative usage caps:

- no model call for common deterministic questions;
- maximum 1,000 model answers per calendar month;
- maximum 50 model answers per calendar day;
- maximum 10 model answers per visitor per day;
- burst limit of 3 requests per visitor per minute;
- short input history and retrieved context;
- short maximum output;
- one model call, no retry, and a server timeout;
- fail-closed local fallback after any limit is reached.

The counters must be persistent and updated atomically so they survive server restarts and cannot be bypassed by multiple application processes. Only pseudonymous rate-limit identifiers and aggregate usage are stored; message content is not logged for this purpose.

The Google billing account must also receive a 5 EUR budget/spend control. This is an external account setting and cannot be guaranteed by repository code alone. The local implementation will expose the required configuration and fail safely when it is missing.

## Contact consolidation

All public page references to `hello@make-success-your-habit.com`, `heike@heike-ziegler.com`, `care@heike-ziegler.com`, and `support@heike-ziegler.com` are replaced with `contact@heike-ziegler.com`, including German and English legal-page HTML. Form placeholders are changed to neutral wording rather than displaying a fake email address.

Repository documentation and admin authentication defaults are not public contact copy and are excluded to avoid breaking access. Linked legal PDFs must be inspected separately; if their legal wording needs alteration, that requires confirmation from the person responsible for those documents before replacement.

## Failure behavior

- Missing model key: deterministic help remains available; AI questions receive a concise unavailable message and contact button.
- Rate or budget reached: no provider call; local limit message and contact button.
- Unsafe or malformed model response: discard it and use the local fallback.
- Provider timeout/error: no retry; local fallback.
- Unknown question or absent source: say that the information is not on the website and direct to the approved contact address.

## Verification

Automated checks cover:

- route-to-knowledge coverage for all public DE/EN pages;
- deterministic ISOBL and contact answers in both languages;
- localized allow-listed navigation only;
- rejection of arbitrary URLs, HTML, scripts, prompt-injection payloads, malformed structured output, oversized input, audio, and invalid roles;
- persistent per-minute, per-day, per-visitor, and monthly limits;
- no model call after a limit is reached;
- exactly one model call per accepted AI request;
- safe behavior without an API key and on provider failure;
- absence of old public contact addresses;
- widget visibility on public desktop and mobile pages and absence from admin routes.

The local browser review covers the homepage, ISOBL, a blog page, and a legal page in German and English at small and large widths. It verifies opening, closing, messaging, the safe navigation button, keyboard use, and non-obstruction of page controls.

## Local-only delivery

Implementation, content preparation, provider configuration examples, and verification remain local. Nothing is uploaded or published without a separate, explicit publication request after the user reviews the local result.
