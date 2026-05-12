export function formatTimestamp(value) {
  if (!value) {
    return "No timestamp";
  }

  return new Date(value).toLocaleString();
}

export function toDatetimeLocalValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
