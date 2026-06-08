const KEYWORDS = new Set([
  "export",
  "const",
  "as",
  "true",
  "false",
  "console",
  "log",
]);

type Token = { text: string; className: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const rest = line.slice(i);

    if (rest.startsWith("//")) {
      tokens.push({ text: rest, className: "text-white/35" });
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
      tokens.push({ text: rest.slice(0, j), className: "text-emerald-400/90" });
      i += j;
      continue;
    }

    if (/^[A-Za-z_$][\w$]*/.test(rest)) {
      const match = rest.match(/^[A-Za-z_$][\w$]*/);
      const word = match?.[0] ?? "";
      const className = KEYWORDS.has(word)
        ? "text-violet-400/90"
        : word === "developer"
          ? "text-sky-400/90"
          : "text-amber-200/85";
      tokens.push({ text: word, className });
      i += word.length;
      continue;
    }

    if (/^\d+/.test(rest)) {
      const match = rest.match(/^\d+/);
      const num = match?.[0] ?? "";
      tokens.push({ text: num, className: "text-orange-300/90" });
      i += num.length;
      continue;
    }

    tokens.push({
      text: rest[0],
      className: /[{}[\](),:;.]/.test(rest[0])
        ? "text-white/50"
        : "text-white/75",
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
