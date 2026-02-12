export const THINGSPEAK_CHANNEL_ID = "3175273";

export const CHART_FRAME_STYLE = {
  width: "100%",
  height: "100%",
  border: "none",
};

export const getThingSpeakChartUrl = ({ field, color }) => {
  const base = `https://thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/charts/${field}`;
  const params = new URLSearchParams({
    bgcolor: "0B0F14",
    color,
    dynamic: "true",
    type: "line",
    results: "120",
  });

  return `${base}?${params.toString()}`;
};
