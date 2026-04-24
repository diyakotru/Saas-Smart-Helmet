import { jsPDF } from "jspdf";

const PAGE_HEIGHT = 297;
const MARGIN = 14;
const LINE_HEIGHT = 6;

const textColor = [30, 41, 59];
const mutedColor = [100, 116, 139];

const setTextColor = (doc, color = textColor) => {
  doc.setTextColor(color[0], color[1], color[2]);
};

const ensureSpace = (doc, y, neededHeight) => {
  if (y + neededHeight <= PAGE_HEIGHT - MARGIN) return y;
  doc.addPage();
  return MARGIN;
};

const addParagraph = (doc, y, text, options = {}) => {
  const { font = "normal", size = 11, color = textColor, indent = 0, spacingAfter = 3 } = options;
  doc.setFont("helvetica", font);
  doc.setFontSize(size);
  setTextColor(doc, color);

  const lines = doc.splitTextToSize(String(text ?? ""), 196 - (MARGIN + indent));
  const requiredHeight = Math.max(LINE_HEIGHT, lines.length * (LINE_HEIGHT - 1));
  y = ensureSpace(doc, y, requiredHeight + spacingAfter);
  doc.text(lines, MARGIN + indent, y);
  return y + requiredHeight + spacingAfter;
};

const addSectionTitle = (doc, y, title) => {
  y = ensureSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  setTextColor(doc, textColor);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(180, 188, 201);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 2, 196, y + 2);
  return y + 8;
};

const addBullet = (doc, y, text) => addParagraph(doc, y, `- ${text}`, { size: 11.5, spacingAfter: 2.5 });

const formatDateTime = (date) => {
  if (!date) return "--";
  return date.toLocaleString();
};

const drawTableHeader = (doc, y, columns) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, textColor);
  doc.setDrawColor(180, 188, 201);
  doc.setLineWidth(0.2);

  let x = MARGIN;
  columns.forEach((column) => {
    doc.rect(x, y, column.width, 7);
    doc.text(column.header, x + 1.5, y + 4.7);
    x += column.width;
  });

  return y + 7;
};

const drawTableRow = (doc, y, columns, values) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  setTextColor(doc, textColor);

  const wrappedByColumn = columns.map((column, index) =>
    doc.splitTextToSize(String(values[index] ?? "--"), Math.max(8, column.width - 3))
  );

  const lineCount = Math.max(...wrappedByColumn.map((lines) => lines.length), 1);
  const rowHeight = Math.max(7, lineCount * 4 + 2);

  let x = MARGIN;
  columns.forEach((column, index) => {
    doc.rect(x, y, column.width, rowHeight);
    doc.text(wrappedByColumn[index], x + 1.5, y + 4.2);
    x += column.width;
  });

  return y + rowHeight;
};

const addComplianceTable = (doc, y, rows = []) => {
  const columns = [
    { header: "Timestamp", width: 48 },
    { header: "Temp (C)", width: 20 },
    { header: "Humidity (%)", width: 26 },
    { header: "Gas (ADC)", width: 24 },
    { header: "Motion", width: 20 },
    { header: "Flame", width: 18 },
    { header: "Alerts", width: 42 },
    { header: "Unsafe", width: 16 },
  ];

  const fallbackRows = [
    {
      timestamp: "No logs available",
      temperature: "--",
      humidity: "--",
      gas: "--",
      motion: "--",
      flame: "--",
      alerts: "No compliance rows in selected window",
      unsafe: "--",
    },
  ];

  const safeRows = Array.isArray(rows) && rows.length > 0 ? rows : fallbackRows;
  const visibleRows = safeRows.slice(0, 60);
  const isTruncated = safeRows.length > visibleRows.length;

  y = ensureSpace(doc, y, 12);
  y = drawTableHeader(doc, y, columns);

  visibleRows.forEach((row) => {
    const values = [
      row?.timestamp ? formatDateTime(row.timestamp) : "--",
      row?.temperature ?? "--",
      row?.humidity ?? "--",
      row?.gas ?? "--",
      row?.motion ?? "--",
      row?.flame ?? "--",
      row?.alerts ?? "None",
      row?.unsafe ?? "No",
    ];

    const estimatedLines = Math.max(
      ...columns.map((column, columnIndex) =>
        doc.splitTextToSize(String(values[columnIndex] ?? "--"), Math.max(8, column.width - 3)).length
      )
    );
    const estimatedHeight = Math.max(7, estimatedLines * 4 + 2);

    if (y + estimatedHeight > PAGE_HEIGHT - MARGIN - 6) {
      doc.addPage();
      y = MARGIN;
      y = drawTableHeader(doc, y, columns);
    }

    y = drawTableRow(doc, y, columns, values);
  });

  if (isTruncated) {
    y += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    setTextColor(doc, mutedColor);
    doc.text("Additional rows were omitted for readability. View dashboard for complete history.", MARGIN, y);
  }

  return y + 4;
};

export const downloadCompliancePDF = ({ complianceRows = [], generatedAt = new Date() }) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  setTextColor(doc, textColor);
  doc.text("SMART HELMET COMPLIANCE REPORT", MARGIN, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.8);
  setTextColor(doc, mutedColor);
  doc.text(`Generated on ${generatedAt.toLocaleString()}`, MARGIN, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, textColor);
  doc.text("Compliance Log Entries", MARGIN, 36);
  doc.setDrawColor(180, 188, 201);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, 38, 196, 38);

  let y = 44;
  y = addComplianceTable(doc, y, complianceRows);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor(doc, mutedColor);
  doc.text("This document is generated from the dashboard compliance logs.", MARGIN, 287);

  doc.save("smart-helmet-compliance-report.pdf");
};

export const downloadPDF = ({
  riskLevel,
  incidents = [],
  unsafeMinutes = 0,
  alertsPerShift,
  latestIncident,
  latestReading,
  temperatureStatus,
  humidityStatus,
  gasStatus,
  motionStatus,
  flameStatus,
  generatedAt = new Date(),
}) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  setTextColor(doc, textColor);
  doc.text("SMART HELMET COMPLIANCE REPORT", MARGIN, 18);

  let y = 26;
  y = addParagraph(
    doc,
    y,
    "Professional text-only compliance summary for audits, operations, and leadership review.",
    { size: 11, color: [71, 85, 105], spacingAfter: 6 }
  );

  y = addSectionTitle(doc, y, "1. Overall Status");
  y = addBullet(doc, y, `AI Risk Level: ${riskLevel?.level ?? "SAFE"}`);
  y = addBullet(
    doc,
    y,
    `System Status: ${incidents.length > 0 ? "Threshold alerts detected in this period." : "Operating within safe limits."}`
  );
  y = addBullet(
    doc,
    y,
    `Latest Reading: ${latestReading ? `${latestReading.temperature ?? "--"}°C, ${latestReading.humidity ?? "--"}%, ${latestReading.gas ?? "--"} ADC, motion ${latestReading.motion ?? "--"}, flame ${latestReading.flame ?? "--"}` : "No live sensor data available."}`
  );

  y = addSectionTitle(doc, y, "2. Safety Metrics");
  y = addBullet(doc, y, `Unsafe Exposure Time: ${Number.isFinite(unsafeMinutes) ? unsafeMinutes : 0} minutes`);
  y = addBullet(
    doc,
    y,
    `Alerts per Shift: ${alertsPerShift?.count ?? 0} (${alertsPerShift?.level ?? "LOW"})`
  );
  y = addBullet(
    doc,
    y,
    `Latest Incident: ${latestIncident ? `${latestIncident.type} at ${formatDateTime(latestIncident.timestamp)}` : "No recent incidents recorded."}`
  );

  y = addSectionTitle(doc, y, "3. Environmental Conditions");
  y = addBullet(doc, y, `Temperature Status: ${temperatureStatus || "No reading"}`);
  y = addBullet(doc, y, `Humidity Status: ${humidityStatus || "No reading"}`);
  y = addBullet(doc, y, `Gas Status: ${gasStatus || "No reading"}`);
  y = addBullet(doc, y, `Motion Status: ${motionStatus || "No reading"}`);
  y = addBullet(doc, y, `Flame Status: ${flameStatus || "No reading"}`);

  y = addParagraph(doc, y + 2, `Generated on ${generatedAt.toLocaleString()}`, {
    size: 9,
    color: mutedColor,
    spacingAfter: 0,
  });

  doc.save("smart-helmet-overall-report.pdf");
};

export const generateSafetyReportPdf = downloadPDF;
