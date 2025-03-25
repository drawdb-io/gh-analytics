export function parseReport(data) {
  return data
    .split("\n")
    .map((x) => x.split(","))
    .slice(1);
}
