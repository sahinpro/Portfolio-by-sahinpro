const KEYWORDS = new Set([
  "class",
  "constructor",
  "this",
  "export",
  "const",
  "as",
  "true",
  "false",
  "console",
  "log",
]);

/** LinkedIn cover palette — warm keywords, white identifiers, bright green strings */
const KEYWORD_CLASS = "text-[#CE9178]";
const STRING_CLASS = "text-[#6ECF6E]";
const DEFAULT_CLASS = "text-white";
const PUNCTUATION_CLASS = "text-white";
const COMMENT_CLASS = "text-zinc-500";

type Token = { text: string; className: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const rest = line.slice(i);

    if (rest.startsWith("//")) {
      tokens.push({ text: rest, className: COMMENT_CLASS });
      break;
    }

    if (rest[0] === '"' || rest[0] === "`") {
      const quote = rest[0];
      let j = 1;
      while (j < rest.length) {
        if (rest[j] === "\\") {
          j += 2;
          continue;
        }
        if (rest[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ text: rest.slice(0, j), className: STRING_CLASS });
      i += j;
      continue;
    }

    if (/^[A-Za-z_$][\w$]*/.test(rest)) {
      const match = rest.match(/^[A-Za-z_$][\w$]*/);
      const word = match?.[0] ?? "";
      const className = KEYWORDS.has(word) ? KEYWORD_CLASS : DEFAULT_CLASS;
      tokens.push({ text: word, className });
      i += word.length;
      continue;
    }

    if (/^\d+/.test(rest)) {
      const match = rest.match(/^\d+/);
      const num = match?.[0] ?? "";
      tokens.push({ text: num, className: DEFAULT_CLASS });
      i += num.length;
      continue;
    }

    tokens.push({
      text: rest[0],
      className: /[{}[\](),:;.=]/.test(rest[0])
        ? PUNCTUATION_CLASS
        : DEFAULT_CLASS,
    });
    i += 1;
  }

  return tokens;
}

export function highlightCodeLine(
  line: string,
  keyPrefix: string,
): JSX.Element {
  const tokens = tokenizeLine(line);
  return (
    <span>
      {tokens.map((token, index) => (
        <span key={`${keyPrefix}-${index}`} className={token.className}>
          {token.text}
        </span>
      ))}
    </span>
  );
}
