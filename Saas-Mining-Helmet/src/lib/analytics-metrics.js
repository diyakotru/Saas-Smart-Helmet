export const ANALYTICS_THRESHOLDS = {
  tempHigh: 32,
  humidityLow: 30,
  humidityHigh: 70,
  gasWarning: 300,
  gasDanger: 700,
  motionWarning: 2,
  motionDanger: 4,
  flameWarning: 1,
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
      motion: parseNumberWithFallback(feed.field8),
      flame: parseNumberWithFallback(feed.field4),
    }))
    .filter((row) => row.timestamp instanceof Date && !Number.isNaN(row.timestamp.getTime()))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

export const isUnsafeReading = (row, thresholds) => {
  if (!row) return false;
  const tempUnsafe = row.temperature != null && row.temperature > thresholds.tempHigh;
  const gasUnsafe = row.gas != null && row.gas > thresholds.gasWarning;
  const motionUnsafe = row.motion != null && row.motion > thresholds.motionDanger;
  const flameUnsafe = row.flame != null && row.flame >= thresholds.flameWarning;
  return tempUnsafe || gasUnsafe || motionUnsafe || flameUnsafe;
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

    if (row.motion != null && row.motion > thresholds.motionWarning) {
      incidents.push({
        id: `motion-${row.id}`,
        timestamp: row.timestamp,
        type: row.motion > thresholds.motionDanger ? "Motion Spike" : "Motion Alert",
        severity: row.motion > thresholds.motionDanger ? "High" : "Medium",
        message: `Motion intensity reached ${row.motion}`,
      });
    }

    if (row.flame != null && row.flame >= thresholds.flameWarning) {
      incidents.push({
        id: `flame-${row.id}`,
        timestamp: row.timestamp,
        type: "Flame Alert",
        severity: "High",
        message: `Flame sensor detected heat or flame presence at ${row.flame}`,
      });
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

export const computeAverageValue = (rows, key) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const values = rows.map((row) => row?.[key]).filter((value) => Number.isFinite(value));
  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const computeTrendDelta = (rows, key, lookbackHours = 1) => {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  const latest = rows[rows.length - 1];
  const latestValue = latest?.[key];
  const latestTimestamp = latest?.timestamp;

  if (!Number.isFinite(latestValue) || !(latestTimestamp instanceof Date)) return null;

  const targetTime = latestTimestamp.getTime() - lookbackHours * 60 * 60 * 1000;
  const referenceRow = [...rows]
    .reverse()
    .find((row) => row.timestamp instanceof Date && row.timestamp.getTime() <= targetTime && Number.isFinite(row?.[key]));

  const fallbackRow = rows[0];
  const comparisonRow = referenceRow || fallbackRow;

  if (!comparisonRow || !Number.isFinite(comparisonRow?.[key])) return null;

  return latestValue - comparisonRow[key];
};

export const formatSignedMetricDelta = (value, unit = "", fractionDigits = 1) => {
  if (!Number.isFinite(value)) return "--";

  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value).toFixed(fractionDigits);
  return `${sign}${absoluteValue}${unit}`;
};

const getLatestReading = (rows) => (Array.isArray(rows) && rows.length > 0 ? rows[rows.length - 1] : null);

const getRecentSeries = (rows, key, limit = 5) =>
  (Array.isArray(rows) ? rows.slice(-limit) : [])
    .map((row) => row?.[key])
    .filter((value) => Number.isFinite(value));

const isStrictlyIncreasing = (values) =>
  Array.isArray(values) && values.length >= 4 && values.every((value, index) => index === 0 || value > values[index - 1]);

const summarizeRiskLevel = (score) => {
  if (score >= 7) return { level: "DANGER", tone: "text-red-300", ring: "border-red-500/40" };
  if (score >= 4) return { level: "WARNING", tone: "text-amber-300", ring: "border-amber-500/40" };
  return { level: "SAFE", tone: "text-emerald-300", ring: "border-emerald-500/40" };
};

export const detectTrendSignals = (rows, thresholds) => {
  const signals = [];
  const latest = getLatestReading(rows);
  const gasSeries = getRecentSeries(rows, "gas", 5);
  const temperatureSeries = getRecentSeries(rows, "temperature", 5);
  const humiditySeries = getRecentSeries(rows, "humidity", 5);
  const motionSeries = getRecentSeries(rows, "motion", 5);

  if (isStrictlyIncreasing(gasSeries) && gasSeries[gasSeries.length - 1] >= thresholds.gasWarning) {
    signals.push({
      id: "gas-rising",
      label: "Gas rising continuously",
      severity: "High",
      message: `Gas has increased across ${gasSeries.length} consecutive readings and now sits at ${gasSeries[gasSeries.length - 1]} ADC.`,
    });
  }

  if (isStrictlyIncreasing(temperatureSeries) && temperatureSeries[temperatureSeries.length - 1] >= thresholds.tempHigh) {
    signals.push({
      id: "temperature-rising",
      label: "Temperature climbing steadily",
      severity: "Medium",
      message: `Temperature has climbed through the latest readings and is now ${temperatureSeries[temperatureSeries.length - 1]}°C.`,
    });
  }

  if (humiditySeries.length >= 4 && humiditySeries.every((value, index) => index === 0 || value < humiditySeries[index - 1])) {
    const latestHumidity = humiditySeries[humiditySeries.length - 1];
    signals.push({
      id: "humidity-dropping",
      label: "Humidity falling continuously",
      severity: "Low",
      message: `Humidity has been falling for ${humiditySeries.length} readings and is now ${latestHumidity}%.`,
    });
  }

  if (latest && latest.gas != null && latest.gas > thresholds.gasDanger) {
    signals.push({
      id: "gas-danger-latest",
      label: "Immediate gas hazard",
      severity: "High",
      message: `Latest gas reading is at critical level (${latest.gas} ADC).`,
    });
  }

  if (motionSeries.length >= 4 && motionSeries.every((value, index) => index === 0 || value > motionSeries[index - 1])) {
    signals.push({
      id: "motion-rising",
      label: "Motion activity rising",
      severity: motionSeries[motionSeries.length - 1] > thresholds.motionDanger ? "High" : "Medium",
      message: `Motion intensity has increased across ${motionSeries.length} readings and is now ${motionSeries[motionSeries.length - 1]}.`,
    });
  }

  if (latest && latest.flame != null && latest.flame >= thresholds.flameWarning) {
    signals.push({
      id: "flame-latest",
      label: "Flame detected",
      severity: "High",
      message: `Latest flame reading indicates fire presence (${latest.flame}).`,
    });
  }

  return signals;
};

export const calculateAiRiskLevel = ({ rows, incidents, unsafeMinutes, alertsPerShift, trendSignals, thresholds }) => {
  let score = 0;
  const latest = getLatestReading(rows);
  const recentIncidents = Array.isArray(incidents) ? incidents.slice(0, 3) : [];
  const highSeverityIncidents = recentIncidents.filter((incident) => incident.severity === "High").length;

  if (latest?.gas != null) {
    if (latest.gas > thresholds.gasDanger) score += 4;
    else if (latest.gas > thresholds.gasWarning) score += 2;
  }

  if (latest?.temperature != null && latest.temperature > thresholds.tempHigh) {
    score += 2;
  }

  if (latest?.motion != null && latest.motion > thresholds.motionWarning) {
    score += latest.motion > thresholds.motionDanger ? 3 : 1;
  }

  if (latest?.flame != null && latest.flame >= thresholds.flameWarning) {
    score += 4;
  }

  if (unsafeMinutes >= 60) score += 2;
  else if (unsafeMinutes >= 20) score += 1;

  if (alertsPerShift?.count >= 6) score += 2;
  else if (alertsPerShift?.count >= 3) score += 1;

  score += highSeverityIncidents * 2;
  score += recentIncidents.filter((incident) => incident.severity === "Medium").length;

  if (Array.isArray(trendSignals) && trendSignals.some((signal) => signal.severity === "High")) {
    score += 2;
  }

  if (Array.isArray(trendSignals) && trendSignals.some((signal) => signal.severity === "Medium")) {
    score += 1;
  }

  const summary = summarizeRiskLevel(score);
  const reasonParts = [];

  if (latest?.gas != null) reasonParts.push(`latest gas ${latest.gas} ADC`);
  if (latest?.temperature != null) reasonParts.push(`latest temperature ${latest.temperature}°C`);
  if (latest?.motion != null) reasonParts.push(`latest motion ${latest.motion}`);
  if (latest?.flame != null) reasonParts.push(`latest flame ${latest.flame}`);
  if (unsafeMinutes > 0) reasonParts.push(`${unsafeMinutes} unsafe minute${unsafeMinutes === 1 ? "" : "s"}`);
  if (alertsPerShift?.count > 0) reasonParts.push(`${alertsPerShift.count} alert${alertsPerShift.count === 1 ? "" : "s"} this shift`);
  if (Array.isArray(trendSignals) && trendSignals.length > 0) {
    reasonParts.push(trendSignals[0].label.toLowerCase());
  }

  return {
    level: summary.level,
    tone: summary.tone,
    ring: summary.ring,
    score,
    reason: reasonParts.length > 0 ? reasonParts.join("; ") : "No active risk drivers detected.",
  };
};

export const buildAiInsights = ({ rows, incidents, unsafeMinutes, alertsPerShift, trendSignals }) => {
  const insights = [];
  const latest = getLatestReading(rows);
  const latestIncident = Array.isArray(incidents) && incidents.length > 0 ? incidents[0] : null;

  insights.push(
    `Unsafe exposure totaled ${unsafeMinutes} minute${unsafeMinutes === 1 ? "" : "s"} across the latest 24-hour window.`
  );

  insights.push(
    `Alert activity is ${alertsPerShift.count} event${alertsPerShift.count === 1 ? "" : "s"} per shift, which maps to a ${alertsPerShift.level} operating load.`
  );

  if (latestIncident) {
    insights.push(
      `Latest incident: ${latestIncident.type} at ${formatClockTime(latestIncident.timestamp)} with ${latestIncident.severity} severity.`
    );
  } else {
    insights.push("No recent incidents were recorded in the active monitoring window.");
  }

  if (Array.isArray(trendSignals) && trendSignals.length > 0) {
    insights.push(trendSignals[0].message);
  } else if (latest?.gas != null || latest?.temperature != null) {
    insights.push("Current readings are stable enough to keep the helmet within the SAFE operating band.");
  }

  return insights;
};

export const buildAiRecommendations = ({ rows, thresholds, trendSignals, riskLevel }) => {
  const latest = getLatestReading(rows);
  const recommendations = [];

  if (latest?.gas != null && latest.gas >= thresholds.gasWarning) {
    recommendations.push("Improve ventilation immediately because gas levels are elevated.");
  }

  if (latest?.temperature != null && latest.temperature >= thresholds.tempHigh) {
    recommendations.push("Reduce exposure and rotate workers because temperature is above the safe band.");
  }

  if (latest?.humidity != null && (latest.humidity < thresholds.humidityLow || latest.humidity > thresholds.humidityHigh)) {
    recommendations.push("Adjust airflow and dehumidification to restore humidity to the comfort band.");
  }

  if (latest?.motion != null && latest.motion >= thresholds.motionWarning) {
    recommendations.push("Review motion tracking because MPU6050 readings suggest active movement or impact.");
  }

  if (latest?.flame != null && latest.flame >= thresholds.flameWarning) {
    recommendations.push("Treat the flame detection signal as a fire alert and trigger the response workflow.");
  }

  if (Array.isArray(trendSignals) && trendSignals.some((signal) => signal.id === "gas-rising")) {
    recommendations.push("Escalate monitoring and keep extraction fans active because gas is rising continuously.");
  }

  if (riskLevel?.level === "DANGER") {
    recommendations.push("Pause non-essential work and alert the supervisor until the environment returns to SAFE.");
  } else if (riskLevel?.level === "WARNING") {
    recommendations.push("Increase worker check-ins and shorten exposure cycles while conditions are being stabilized.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Conditions are stable; keep the current monitoring cadence and log the next sampling window.");
  }

  return recommendations;
};

const formatHourWindow = (hour) => {
  const endHour = (hour + 2) % 24;
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(hour)}:00-${pad(endHour)}:00`;
};

export const buildRiskInsights = (incidents, rows = [], trendSignals = []) => {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    const fallback = ["No recurring risk patterns detected in the current window."];
    if (Array.isArray(trendSignals) && trendSignals.length > 0) {
      fallback.unshift(`Trend signal detected: ${trendSignals[0].message}`);
    }
    return fallback;
  }

  const gasIncidents = incidents.filter((incident) => incident.type.includes("Gas"));
  const tempIncidents = incidents.filter((incident) => incident.type.includes("Temperature"));
  const motionIncidents = incidents.filter((incident) => incident.type.includes("Motion"));
  const flameIncidents = incidents.filter((incident) => incident.type.includes("Flame"));
  const latestReading = getLatestReading(rows);
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

  const motionInsight = buildHourlyInsight(motionIncidents, "Motion");
  if (motionInsight) insights.push(motionInsight);

  const flameInsight = buildHourlyInsight(flameIncidents, "Flame");
  if (flameInsight) insights.push(flameInsight);

  const daySet = new Set(incidents.map((incident) => incident.timestamp.toDateString()));
  if (daySet.size >= 2) {
    insights.push("Alerts repeat across multiple days, suggesting a persistent operational pattern.");
  }

  if (Array.isArray(trendSignals) && trendSignals.length > 0) {
    insights.push(`AI trend check: ${trendSignals[0].label} because ${trendSignals[0].message}`);
  }

  if (latestReading?.gas != null && latestReading.gas > 0) {
    insights.push(`Latest gas reading is ${latestReading.gas} ADC, which keeps the risk model responsive to current conditions.`);
  }

  if (latestReading?.motion != null) {
    insights.push(`Latest motion reading is ${latestReading.motion}, feeding motion tracking into the risk model.`);
  }

  if (latestReading?.flame != null) {
    insights.push(`Latest flame reading is ${latestReading.flame}, which is monitored as a fire detection signal.`);
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
    if (row.motion != null && row.motion > thresholds.motionWarning) alerts.push("Motion");
    if (row.flame != null && row.flame >= thresholds.flameWarning) alerts.push("Flame");
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
      motion: row.motion,
      flame: row.flame,
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
