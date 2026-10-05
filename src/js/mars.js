import { loadHeaderFooter } from './utilis.mjs';

loadHeaderFooter();

const weatherElement = document.querySelector("#mars-weather");
const statusElement = document.querySelector("#mars-weather-status");

// Load and display the latest archived Mars weather from NASA InSight API
async function loadMarsWeather() {
  if (!weatherElement || !statusElement) return;

  // Get the NASA API key from environment variables
  const apiKey = import.meta.env.VITE_NASA_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_NASA_API_KEY is not configured.");
  }

  // Construct the URL for the NASA InSight API request
  const insightURL = new URL("https://api.nasa.gov/insight_weather/");
  insightURL.search = new URLSearchParams({
    api_key: apiKey,
    feedtype: "json",
    ver: "1.0",
  });

  // Fetch the latest archived weather data from NASA InSight API
  const response = await fetch(insightURL);
  if (!response.ok) {
    throw new Error(`NASA InSight API request failed (${response.status}).`);
  }

  // Parse the JSON response to extract weather data
  const weatherData = await response.json();
  const latestSol = weatherData.sol_keys?.at(-1);
  const observation = latestSol && weatherData[latestSol];
  if (!observation?.AT || !observation?.PRE || !observation?.HWS) {
    throw new Error("NASA InSight API returned no usable weather observations.");
  }

  const formatNumber = (value) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);
  const formatUtcDate = (value) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value));
  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  };

  const report = document.createElement("article");
  report.className = "weather-report";

  const header = document.createElement("header");
  header.className = "weather-report__header";
  const headingGroup = document.createElement("div");
  headingGroup.append(
    createElement("p", "weather-report__eyebrow", "InSight observation"),
    createElement("h3", "weather-report__sol", `Sol ${latestSol}`),
  );
  header.append(
    headingGroup,
    createElement(
      "p",
      "weather-report__period",
      `${formatUtcDate(observation.First_UTC)} – ${formatUtcDate(observation.Last_UTC)} UTC`,
    ),
  );

  const metrics = document.createElement("div");
  metrics.className = "weather-metrics";
  for (const metric of [
    {
      label: "Average temperature",
      value: observation.AT.av,
      unit: "°C",
      range: `${formatNumber(observation.AT.mn)}° to ${formatNumber(observation.AT.mx)}°`,
      className: "temperature",
    },
    {
      label: "Average pressure",
      value: observation.PRE.av,
      unit: "Pa",
      range: `${formatNumber(observation.PRE.mn)} to ${formatNumber(observation.PRE.mx)} Pa`,
      className: "pressure",
    },
    {
      label: "Average wind speed",
      value: observation.HWS.av,
      unit: "m/s",
      range: `${formatNumber(observation.HWS.mn)} to ${formatNumber(observation.HWS.mx)} m/s`,
      className: "wind",
    },
  ]) {
    const card = document.createElement("section");
    card.className = `weather-metric weather-metric--${metric.className}`;
    card.append(
      createElement("p", "weather-metric__label", metric.label),
      createElement("p", "weather-metric__value", formatNumber(metric.value)),
      createElement("p", "weather-metric__unit", metric.unit),
      createElement("p", "weather-metric__range", `Range ${metric.range}`),
    );
    metrics.append(card);
  }

  report.append(header, metrics);
  weatherElement.replaceChildren(report);
  statusElement.textContent = "Latest archived weather observation loaded.";
}

// Error Handler for loading Mars weather data
loadMarsWeather().catch((error) => {
  console.error("Failed to load Mars weather:", error);
  if (statusElement) {
    statusElement.textContent = "Mars weather data could not be loaded. Check the API key and try again.";
  }
});
