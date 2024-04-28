export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;
}

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
