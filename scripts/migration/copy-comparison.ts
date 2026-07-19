import {createHash} from "node:crypto";

type SemanticText = {tag: string; text: string};
type PageCopy = {route: string; semanticText: SemanticText[]};
type CopyRecord = PageCopy & {hash: string};

function hashSemanticText(semanticText: SemanticText[]) {
  return createHash("sha256")
    .update(semanticText.map(({tag, text}) => `${tag}\t${text}`).join("\n"))
    .digest("hex");
}

export function buildCopyInventory(pages: PageCopy[]): CopyRecord[] {
  return pages.map(({route, semanticText}) => ({
    hash: hashSemanticText(semanticText),
    route,
    semanticText,
  }));
}

export function compareCopyInventories(source: CopyRecord[], candidate: CopyRecord[]) {
  const sourceByRoute = new Map(source.map((record) => [record.route, record]));
  const candidateByRoute = new Map(candidate.map((record) => [record.route, record]));
  const missingRoutes = [...sourceByRoute.keys()].filter((route) => !candidateByRoute.has(route)).sort();
  const extraRoutes = [...candidateByRoute.keys()].filter((route) => !sourceByRoute.has(route)).sort();
  const mismatches = [...sourceByRoute.entries()]
    .filter(([route, record]) => candidateByRoute.get(route)?.hash !== record.hash && candidateByRoute.has(route))
    .map(([route, record]) => ({
      actual: candidateByRoute.get(route)?.semanticText || [],
      expected: record.semanticText,
      route,
    }));
  return {
    extraRoutes,
    mismatches,
    missingRoutes,
    ok: missingRoutes.length === 0 && extraRoutes.length === 0 && mismatches.length === 0,
  };
}
