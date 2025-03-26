export function parseReportData(dataString) {
  const rows = dataString.split("\n").map((x) => x.split(","));
  return {
    headers: rows[0],
    data: rows.slice(1),
  };
}
