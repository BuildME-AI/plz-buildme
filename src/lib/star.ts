export type StarSections = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

export function parseStarSections(summary: string): StarSections {
  const text = summary.trim();
  if (!text) {
    return { situation: "", task: "", action: "", result: "" };
  }

  const labeled = parseLabeledStar(text);
  if (labeled.situation || labeled.task || labeled.action || labeled.result) {
    return labeled;
  }

  const sentences = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const star: StarSections = { situation: "", task: "", action: "", result: "" };
  for (const sentence of sentences) {
    if (!star.result && /(\d+%|\d+\s*(건|명|배|일|주|월)|성과|결과|달성|증가|감소|향상|개선|절감|효과)/.test(sentence)) {
      star.result = sentence;
      continue;
    }
    if (!star.action && /(실행|개선|도입|진행|구축|협업|분석|기획|수행|적용)/.test(sentence)) {
      star.action = sentence;
      continue;
    }
    if (!star.task && /(목표|과제|역할|담당|해야|목적으로|달성)/.test(sentence)) {
      star.task = sentence;
      continue;
    }
    if (!star.situation && /(상황|배경|당시|기존|문제|이슈|어려움|발견)/.test(sentence)) {
      star.situation = sentence;
    }
  }

  const parts = splitIntoChunks(sentences.join(" "), 4);
  star.situation = star.situation || parts[0] || "";
  star.task = star.task || parts[1] || "";
  star.action = star.action || parts[2] || "";
  star.result = star.result || parts[3] || "";

  if (star.task === star.situation) star.task = parts[1] || "";
  if (star.action === star.task || star.action === star.situation) star.action = parts[2] || "";
  if (star.result === star.action || star.result === star.task || star.result === star.situation) star.result = parts[3] || "";

  return star;
}

function parseLabeledStar(text: string): StarSections {
  const normalized = text.replace(/\r/g, "");
  const markers = [
    { key: "situation", regex: /(S\(상황\)|Situation|상황)\s*[:\-]?\s*/gi },
    { key: "task", regex: /(T\(과제\)|Task|과제)\s*[:\-]?\s*/gi },
    { key: "action", regex: /(A\(행동\)|Action|Role\s*&\s*Action|행동)\s*[:\-]?\s*/gi },
    { key: "result", regex: /(R\(결과\)|Result|결과)\s*[:\-]?\s*/gi },
  ] as const;

  const hits: Array<{ key: keyof StarSections; index: number; len: number }> = [];
  for (const marker of markers) {
    marker.regex.lastIndex = 0;
    const match = marker.regex.exec(normalized);
    if (match && match.index >= 0) {
      hits.push({ key: marker.key, index: match.index, len: match[0].length });
    }
  }
  if (hits.length === 0) return { situation: "", task: "", action: "", result: "" };

  hits.sort((a, b) => a.index - b.index);
  const out: StarSections = { situation: "", task: "", action: "", result: "" };
  for (let i = 0; i < hits.length; i++) {
    const current = hits[i];
    const start = current.index + current.len;
    const end = i + 1 < hits.length ? hits[i + 1].index : normalized.length;
    const content = normalized.slice(start, end).trim();
    if (content && !out[current.key]) {
      out[current.key] = content;
    }
  }
  return out;
}

function splitIntoChunks(text: string, size: number) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return Array.from({ length: size }, () => "");
  const words = cleaned.split(" ");
  const chunkSize = Math.max(1, Math.ceil(words.length / size));
  const chunks: string[] = [];
  for (let i = 0; i < size; i++) {
    const start = i * chunkSize;
    const end = Math.min(words.length, start + chunkSize);
    chunks.push(words.slice(start, end).join(" ").trim());
  }
  return chunks;
}
