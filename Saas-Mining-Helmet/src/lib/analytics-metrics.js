export const ANALYTICS_THRESHOLDS = {
  tempHigh: 32,
  humidityLow: 30,
  humidityHigh: 70,
  gasWarning: 300,
  gasDanger: 700,
};

const parseNumberWithFallback = (value, fallback = null) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeFeeds = (feeds) => {
  if (!Array.isArray(feeds)) return [];

  return feeds
    .map((feed) => ({
      id: feed.entry_id,
      timestamp: feed.created_at ? new Date(feed.created_at) : null,
      temperature: parseNumberWithFallback(feed.field1),
      humidity: parseNumberWithFallback(feed.field2),
      gas: parseNumberWithFallback(feed.field3),
    }))
    .filter((row) => row.timestamp instanceof Date && !Number.isNaN(row.timestamp.getTime()))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

export const isUnsafeReading = (row, thresholds) => {
  if (!row) return false;
  const tempUnsafe = row.temperature != null && row.temperature > thresholds.tempHigh;
  const gasUnsafe = row.gas != null && row.gas > thresholds.gasWarning;
  return tempUnsafe || gasUnsafe;
};

export const buildIncidents = (rows, thresholds) => {
  const incidents = [];

  rows.forEach((row) => {
    if (row.gas != null) {
      if (row.gas > thresholds.gasDanger) {
        incidents.push({
          id: `gas-danger-${row.id}`,
          timestamp: row.timestamp,
          type: "Gas Warning",
          severity: "High",
          message: `Gas critical at ${row.gas} ADC`,
        });
      } else if (row.gas > thresholds.gasWarning) {
        incidents.push({
          id: `gas-warning-${row.id}`,
          timestamp: row.timestamp,
          type: "Gas Warning",
          severity: "Medium",
          message: `Gas elevated at ${row.gas} ADC`,
        });
      }
    }

    if (row.temperature != null && row.temperature > thresholds.tempHigh) {
      incidents.push({
        id: `temp-high-${row.id}`,
        timestamp: row.timestamp,
        type: "Temperature Spike",
        severity: "Medium",
        message: `Temperature reached ${row.temperature}°C`,
      });
    }

    if (
      row.humidity != null &&
      (row.humidity < thresholds.humidityLow || row.humidity > thresholds.humidityHigh)
    ) {
      incidents.push({
        id: `humidity-${row.id}`,
        timestamp: row.timestamp,
        type: "Humidity Alert",
        severity: "Low",
        message: `Humidity out of range at ${row.humidity}%`,
      });
    }
  });

  return incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const computeUnsafeExposureMinutes = (rows, thresholds) => {
  if (rows.length < 2) return 0;
  let totalMs = 0;

  for (let i = 0; i < rows.length - 1; i += 1) {
    if (isUnsafeReading(rows[i], thresholds)) {
      const delta = rows[i + 1].timestamp.getTime() - rows[i].timestamp.getTime();
      if (delta > 0) totalMs += delta;
    }
  }

  return Math.max(0, Math.round(totalMs / 60000));
};

export const computeAlertsPerShift = (incidents, shiftHours = 8) => {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return { count: 0, level: "LOW" };
  }

  const now = new Date();
  const shiftStart = new Date(now.getTime() - shiftHours * 60 * 60 * 1000);
  const count = incidents.filter((incident) => incident.timestamp >= shiftStart).length;

  let level = "LOW";
  if (count >= 6) level = "HIGH";
  else if (count >= 3) level = "MEDIUM";

  return { count, level };
};

const formatHourWindow = (hour) => {
  const endHour = (hour + 2) % 24;
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(hour)}:00-${pad(endHour)}:00`;
};

export const buildRiskInsights = (incidents) => {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return ["No recurring risk patterns detected in the current window."];
  }

  const gasIncidents = incidents.filter((incident) => incident.type.includes("Gas"));
  const tempIncidents = incidents.filter((incident) => incident.type.includes("Temperature"));
  const insights = [];

  const buildHourlyInsight = (items, label) => {
    if (items.length < 2) return null;
    const buckets = Array.from({ length: 24 }, () => 0);
    items.forEach((incident) => {
      buckets[incident.timestamp.getHours()] += 1;
    });
    const peakHour = buckets.indexOf(Math.max(...buckets));
    if (buckets[peakHour] < 2) return null;
    return `${label} risk consistently increases around ${formatHourWindow(peakHour)}.`;
  };

  const gasInsight = buildHourlyInsight(gasIncidents, "Gas");
  if (gasInsight) insights.push(gasInsight);

  const tempInsight = buildHourlyInsight(tempIncidents, "Temperature");
  if (tempInsight) insights.push(tempInsight);

  const daySet = new Set(incidents.map((incident) => incident.timestamp.toDateString()));
  if (daySet.size >= 2) {
    insights.push("Alerts repeat across multiple days, suggesting a persistent operational pattern.");
  }

  if (insights.length === 0) {
    insights.push("Current data does not show a consistent time-based risk pattern.");
  }

  return insights;
};

export const buildComplianceRows = (rows, thresholds, limit = 20) => {
  const sorted = [...rows].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return sorted.slice(0, limit).map((row) => {
    const alerts = [];
    if (row.gas != null && row.gas > thresholds.gasWarning) alerts.push("Gas");
    if (row.temperature != null && row.temperature > thresholds.tempHigh) alerts.push("Temperature");
    if (
      row.humidity != null &&
      (row.humidity < thresholds.humidityLow || row.humidity > thresholds.humidityHigh)
    ) {
      alerts.push("Humidity");
    }

    return {
      timestamp: row.timestamp,
      temperature: row.temperature,
      humidity: row.humidity,
      gas: row.gas,
      alerts: alerts.length > 0 ? alerts.join("; ") : "None",
      unsafe: isUnsafeReading(row, thresholds) ? "Yes" : "No",
    };
  });
};

export const formatDateTime = (date) => {
  if (!date) return "--";
  return date.toLocaleString();
};

export const formatClockTime = (date) => {
  if (!date) return "--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const buildComplianceCsv = (rows) => {
  const header = ["Timestamp", "Temperature", "Humidity", "Gas", "Alerts", "Unsafe"];
  const lines = rows.map((row) => [
    row.timestamp ? row.timestamp.toISOString() : "",
    row.temperature ?? "",
    row.humidity ?? "",
    row.gas ?? "",
    row.alerts ?? "",
    row.unsafe ?? "",
  ]);

  return [header, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
    .join("\n");
};
