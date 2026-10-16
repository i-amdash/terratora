"use client";

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

export function AdminDataTools({ from, to, onFromChange, onToChange, onClear, onExport, count }: { from: string; to: string; onFromChange: (value: string) => void; onToChange: (value: string) => void; onClear: () => void; onExport: () => void; count: number }) {
  return <div className="admin-data-tools">
    <div><label><span>From</span><input type="date" value={from} onChange={(event) => onFromChange(event.target.value)} /></label><label><span>To</span><input type="date" value={to} onChange={(event) => onToChange(event.target.value)} /></label>{(from || to) && <button type="button" onClick={onClear}>Clear dates</button>}</div>
    <button type="button" className="admin-export-button" disabled={!count} onClick={onExport}>Export filtered Excel ({count}) ↓</button>
  </div>;
}

export function isWithinDate(value: unknown, from: string, to: string) {
  if (!from && !to) return true;
  const timestamp = Date.parse(String(value ?? ""));
  if (!Number.isFinite(timestamp)) return false;
  if (from && timestamp < Date.parse(`${from}T00:00:00`)) return false;
  if (to && timestamp > Date.parse(`${to}T23:59:59.999`)) return false;
  return true;
}

export function exportExcel(filename: string, rows: ExportRow[]) {
  if (!rows.length) return;
  const columns = Array.from(rows.reduce((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  const cells = (values: unknown[], header = false) => `<Row>${values.map((value) => `<Cell><Data ss:Type="${typeof value === "number" ? "Number" : "String"}">${escapeXml(formatCell(value, header))}</Data></Cell>`).join("")}</Row>`;
  const sheet = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Export"><Table>${cells(columns.map(titleCase), true)}${rows.map((row) => cells(columns.map((column) => row[column]))).join("")}</Table></Worksheet></Workbook>`;
  const url = URL.createObjectURL(new Blob([sheet], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCell(value: unknown, header: boolean) {
  if (value == null) return "";
  if (header) return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]!);
}
