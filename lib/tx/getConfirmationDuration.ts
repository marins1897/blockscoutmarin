export default function getConfirmationString(durations: Array<number>) {
  if (durations.length === 0) {
    return '';
  }

  const [ lower, upper ] = durations.map((time) => time / 1_000);

  if (!upper) {
    return `Potvrđeno unutar ${ lower.toLocaleString() } secs`;
  }

  if (lower === 0) {
    return `Potvrđeno unutar <= ${ upper.toLocaleString() } secs`;
  }

  return `Potvrđeno unutar ${ lower.toLocaleString() } - ${ upper.toLocaleString() } secs`;
}
