// WeatherApp.tsx
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Thermometer,
  Droplet,
  Wind,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface GeoData {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface WeatherData {
  name: string;
  sys: { country: string };
  main: { temp: number; feels_like: number; humidity: number };
  weather: { main: string; icon: string; description: string }[];
  wind: { speed: number };
  timezone: number;
}

const apiKey = "0c710631357c774ac9974daa5da333f8";

const WeatherApp: React.FC = () => {
  const [cityInput, setCityInput] = useState("");
  const [cityOptions, setCityOptions] = useState<GeoData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");

  const fetchCityOptions = async (query: string) => {
    if (!query.trim()) return setCityOptions([]);
    try {
      const res = await axios.get<GeoData[]>(
        `https://api.openweathermap.org/geo/1.0/direct`,
        { params: { q: query, limit: 5, appid: apiKey } }
      );
      setCityOptions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getWeather = async (city: GeoData) => {
    setError("");
    setWeatherData(null);
    setShowDetails(false);
    setCityInput(`${city.name}, ${city.country}`);
    setCityOptions([]);

    try {
      const weatherRes = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: city.lat,
            lon: city.lon,
            units: "metric",
            appid: apiKey,
          },
        }
      );
      setWeatherData(weatherRes.data);
    } catch (err: any) {
      setError(err.message || "Error fetching weather");
    }
  };

  const getCityTime = (timezoneOffset: number) => {
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + timezoneOffset * 1000);
    return cityTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountryName = (countryCode: string) => {
    try {
      return (
        new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ||
        countryCode
      );
    } catch {
      return countryCode;
    }
  };

  return (
    <div className="flex justify-between items-center flex-col min-h-screen bg-gray-900 p-4 text-white font-poppins">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-sm w-full text-center mt-30"
      >
        <h2 className="text-3xl font-semibold mb-5">Weather App</h2>

        <div className="relative mb-5">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter city"
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                fetchCityOptions(e.target.value);
              }}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                cityOptions[0] &&
                getWeather(cityOptions[0])
              }
              className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <AnimatePresence>
            {cityOptions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 left-0 right-0 bg-gray-800 border border-gray-600 mt-1 rounded-lg shadow-lg max-h-60 overflow-auto"
              >
                {cityOptions.map((c, idx) => (
                  <li
                    key={idx}
                    onClick={() => getWeather(c)}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  >
                    {c.name}, {c.country}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <AnimatePresence>
          {weatherData && (
            <motion.div
              key={weatherData.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-700 rounded-xl p-5 shadow-lg border border-gray-600"
            >
              <h3 className="text-xl font-semibold text-gray-100">
                {weatherData.name},{" "}
                {weatherData.sys.country &&
                  getCountryName(weatherData.sys.country)}
              </h3>

              <p className="text-gray-300 mt-1">
                🕒 Local Time:{" "}
                {weatherData && getCityTime(weatherData.timezone)}
              </p>

              <div className="flex items-center justify-center gap-2 mt-2">
                <Thermometer className="w-6 h-6 text-red-400 mt-2" />
                <h1 className="text-5xl font-roboto-mono">
                  {Math.trunc(weatherData.main.temp)}°C
                </h1>
              </div>

              <img
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                alt={weatherData.weather[0].main}
                className="mx-auto mt-2"
              />
              <p className="capitalize text-gray-300">
                {weatherData.weather[0].description}
              </p>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 text-left space-y-2 px-4 text-gray-300"
                  >
                    <p className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-red-400 mr-2" />{" "}
                      Feels like: {Math.trunc(weatherData.main.feels_like)}°C
                    </p>
                    <p className="flex items-center gap-1">
                      <Droplet className="w-4 h-4 text-blue-400 mr-2" />{" "}
                      Humidity: {weatherData.main.humidity}%
                    </p>
                    <p className="flex items-center gap-1">
                      <Wind className="w-4 h-4 text-green-400 mr-2" /> Wind:{" "}
                      {weatherData.wind.speed} m/s
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-500 shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> More Details
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <p className="text-gray-300">
        &copy; {new Date().getFullYear()} Shashwat Shakya
      </p>
    </div>
  );
};

export default WeatherApp;
