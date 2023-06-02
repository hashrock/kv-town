import twemoji from "https://esm.sh/twemoji@14.0.2";

export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;
}

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function emojiUrl(emoji: string) {
  const cp = twemoji.convert.toCodePoint(emoji);
  return emojiUrlCodePoint(cp);
}

export function emojiUrlCodePoint(codePointStr: string) {
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePointStr}.svg`;
}
