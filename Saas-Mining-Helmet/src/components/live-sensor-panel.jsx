// live-sensor-panel.jsx
'use client';

import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";

const THINGSPEAK_CHANNEL_ID = "3175273";
const THINGSPEAK_READ_API_KEY = "APF8YFJJ6P4Y09X0";
const POLLING_INTERVAL_MS = 5000;
const MAX_ALERT_ROWS = 15;

// Safe parser
const parseNumberWithFallback = (value, fallback = null) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const findLastValidReading = (feeds, fieldName) => {
  if (!feeds || feeds.length === 0) return null;
  // feeds[0] is newest because we use &order=desc
  for (const feed of feeds) {
    const val = feed[fieldName];
    if (val !== null && val !== "" && val !== "nan") {
      return val;
    }
  }
  return null; // No data found in recent history
};

// Alert rules shared across UI + ThingSpeak ingest
const thresholds = {
  tempLow: 20,
  tempHigh: 32,
  humidityLow: 30,
  humidityHigh: 70,
  gasDanger: 700,
  gasWarning: 300,
};

const buildAlertListFromFeeds = (feeds, limits) => {
  if (!Array.isArray(feeds) || feeds.length === 0) return [];

  const alerts = [];

  feeds.forEach((feed) => {
    const timestamp = feed.created_at ? new Date(feed.created_at) : new Date();
    const temp = parseNumberWithFallback(feed.field1);
    const humidity = parseNumberWithFallback(feed.field2);
    const gas = parseNumberWithFallback(feed.field3);

    if (gas != null) {
      if (gas > limits.gasDanger) {
        alerts.push({
          id: `gas-danger-${feed.entry_id}`,
          type: "Gas",
          message: `🔥 Gas leak detected (ADC ${gas})`,
          timestamp,
          severity: "danger",
          value: gas,
        });
      } else if (gas > limits.gasWarning) {
        alerts.push({
          id: `gas-warning-${feed.entry_id}`,
          type: "Gas",
          message: `⚠️ Gas levels high (ADC ${gas})`,
          timestamp,
          severity: "warning",
          value: gas,
        });
      }
    }

    if (temp != null && temp > limits.tempHigh) {
      alerts.push({
        id: `temp-high-${feed.entry_id}`,
        type: "Temperature",
        message: `🌡 High temperature (${temp}°C)`,
        timestamp,
        severity: "warning",
        value: temp,
      });
    }

    if (humidity != null && (humidity < limits.humidityLow || humidity > limits.humidityHigh)) {
      alerts.push({
        id: `humidity-out-${feed.entry_id}`,
        type: "Humidity",
        message: `💧 Humidity out of range (${humidity}%)`,
        timestamp,
        severity: "warning",
        value: humidity,
      });
    }
  });

  return alerts
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, MAX_ALERT_ROWS);
};

export default function LiveSensorDataPanel({ setAlertList }) {
  const [sensors, setSensors] = useState({
    temperature: null,
    humidity: null,
    gasLevels: null,
    lastUpdate: null,
  });

  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const isConfigured =
    THINGSPEAK_CHANNEL_ID.length > 0 &&
    THINGSPEAK_READ_API_KEY.length > 0;

  // Fetching ThingSpeak data
  useEffect(() => {
    if (!isConfigured) return;

    let isMounted = true;

    const fetchSensorData = async () => {
      setIsFetching(true);

      try {
        const response = await fetch(
          `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=${MAX_ALERT_ROWS}&order=desc`
        );

        if (!response.ok) throw new Error(`ThingSpeak error ${response.status}`);

        const data = await response.json();
        const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
        const latest = feeds[0];

        if (!latest) throw new Error("No data yet on ThingSpeak.");

        if (!isMounted) return;

        const lastTemp = findLastValidReading(feeds, 'field1');
        const lastHum = findLastValidReading(feeds, 'field2');
        const lastGas = findLastValidReading(feeds, 'field3');
        const latestTime = feeds[0].created_at;

        setSensors({
          temperature: parseNumberWithFallback(lastTemp),
          humidity: parseNumberWithFallback(lastHum),
          gasLevels: parseNumberWithFallback(lastGas),
          lastUpdate: latest.created_at ? new Date(latestTime) : new Date(),
        });

        if (setAlertList) {
          const alerts = buildAlertListFromFeeds(feeds, thresholds);
          setAlertList(alerts);
        }

        setFetchError(null);

      } catch (err) {
        if (!isMounted) setFetchError(err.message);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchSensorData();
    const id = setInterval(fetchSensorData, POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [isConfigured, setAlertList]);

  // COLORS
  const COLOR = {
    SAFE_TEXT: "text-teal-400",
    WARNING_TEXT: "text-yellow-400",
    DANGER_TEXT: "text-red-500",
    SAFE_BG: "bg-teal-900/20",
    WARNING_BG: "bg-yellow-900/20",
    DANGER_BG: "bg-red-900/20",
    CARD_BORDER: "border-gray-800",
    CARD_HOVER: "hover:border-yellow-600",
  };

  // NEW MQ Thresholds
  const getStatusColor = (type, value) => {
    if (value == null) return "text-gray-500";
    if (type === "temp" && (value < 20 || value > 32)) return COLOR.WARNING_TEXT;
    if (type === "hum" && (value < 30 || value > 70)) return COLOR.WARNING_TEXT;
    if (type === "gas" && value > 300) return value > 700 ? COLOR.DANGER_TEXT : COLOR.WARNING_TEXT;
    return COLOR.SAFE_TEXT;
  };

  const getStatusBg = (type, value) => {
    if (value == null) return "bg-gray-800/60 text-gray-400";

    if (type === "temperature") {
      if (value < thresholds.tempLow) return COLOR.WARNING_BG;
      return COLOR.SAFE_BG;
    }

    if (type === "humidity") {
      if (value < 30 || value > 70) return COLOR.WARNING_BG;
      return COLOR.SAFE_BG;
    }

    if (type === "gas") {
      if (value > 700) return COLOR.DANGER_BG;
      if (value > 300) return COLOR.WARNING_BG;
      return COLOR.SAFE_BG;
    }

    return COLOR.SAFE_BG;
  };

  const statusMessage = fetchError
    ? fetchError
    : sensors.lastUpdate
    ? `Last synced: ${sensors.lastUpdate.toLocaleString()}`
    : "Waiting for data...";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Temperature */}
      <Card className={`p-6 bg-gray-900 border ${COLOR.CARD_BORDER} ${COLOR.CARD_HOVER}`}>
        <p className="text-sm text-gray-400">Temperature</p>
        <p className={`text-3xl font-bold ${getStatusColor("temperature", sensors.temperature)}`}>
          {sensors.temperature ?? "--"}°C
        </p>
        <div className={`px-2 py-1 mt-2 rounded text-xs ${getStatusBg("temperature", sensors.temperature)}`}>
          {sensors.temperature == null
            ? "No data"
            : sensors.temperature > 32
            ? "High Warning"
            : sensors.temperature < 20
            ? "Low Warning"
            : "Normal"}
        </div>
      </Card>

      {/* Humidity */}
      <Card className={`p-6 bg-gray-900 border ${COLOR.CARD_BORDER} ${COLOR.CARD_HOVER}`}>
        <p className="text-sm text-gray-400">Humidity</p>
        <p className={`text-3xl font-bold ${getStatusColor("humidity", sensors.humidity)}`}>
          {sensors.humidity ?? "--"}%
        </p>
        <div className={`px-2 py-1 mt-2 rounded text-xs ${getStatusBg("humidity", sensors.humidity)}`}>
          {sensors.humidity == null
            ? "No data"
            : sensors.humidity > 70
            ? "Humid"
            : sensors.humidity < 30
            ? "Dry"
            : "Comfort"}
        </div>
      </Card>

      {/* Gas */}
      <Card className={`p-6 bg-gray-900 border ${COLOR.CARD_BORDER} ${COLOR.CARD_HOVER}`}>
        <p className="text-sm text-gray-400">Gas Levels (ADC)</p>
        <p className={`text-3xl font-bold ${getStatusColor("gas", sensors.gasLevels)}`}>
          {sensors.gasLevels ?? "--"}
        </p>
        <div className={`px-2 py-1 mt-2 rounded text-xs ${getStatusBg("gas", sensors.gasLevels)}`}>
          {sensors.gasLevels == null
            ? "No data"
            : sensors.gasLevels > 700
            ? "Danger"
            : sensors.gasLevels > 300
            ? "Warning"
            : "Safe"}
        </div>
      </Card>

      {/* Sync Card */}
      <Card className={`p-6 bg-gray-900 border ${COLOR.CARD_BORDER}`}>
        <p className="text-sm text-gray-400">ThingSpeak Sync</p>
        <p className={`text-2xl font-bold ${fetchError ? COLOR.DANGER_TEXT : COLOR.SAFE_TEXT}`}>
          {fetchError ? "Disconnected" : isFetching ? "Updating..." : "Connected"}
        </p>
        <p className="text-xs text-gray-500 mt-2">{statusMessage}</p>
      </Card>

    </div>
  );
}
