export function timezoneLabel(timezone: string, date = new Date()) {
  try {
    const rawOffset = new Intl.DateTimeFormat("en", { timeZone: timezone, timeZoneName: "shortOffset" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value;
    const offset = rawOffset?.replace(/^GMT([+-])/, "GMT $1") ?? "";
    return `${timezone.replaceAll("_", " ")}${offset ? ` (${offset})` : ""}`;
  } catch {
    return timezone;
  }
}
