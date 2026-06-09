"use client";

import { City, ALL_CITIES, CITY_LABELS } from "@/types";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
}

export function Header({ selectedCity, onCityChange }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 w-full border-b backdrop-blur-md"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
        opacity: 0.97,
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:gap-0 sm:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--icon-color)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-6.568a4.47 4.47 0 00-1.5-3.272c-.173-.166-.358-.318-.557-.453C2.453 9.913 2 8.965 2 8c0-2.086 1.394-3.872 3.013-4.342z" />
            </svg>
          </div>
          <h1
            className="text-lg font-bold sm:text-xl"
            style={{ color: "var(--text-primary)" }}
          >
            Hub Events Agent
          </h1>
        </div>

        {/* Right side: City select + Theme toggle */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          <CitySelector
            selectedCity={selectedCity}
            onCityChange={onCityChange}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function CitySelector({
  selectedCity,
  onCityChange,
}: {
  selectedCity: City;
  onCityChange: (city: City) => void;
}) {
  return (
    <div className="relative flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="pointer-events-none absolute left-3 h-4 w-4"
        style={{ color: "var(--icon-color)" }}
      >
        <path
          fillRule="evenodd"
          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
      <select
        value={selectedCity}
        onChange={(e) => onCityChange(e.target.value as City)}
        className="cursor-pointer appearance-none rounded-lg border py-2 pl-9 pr-8 text-sm font-medium outline-none transition-all duration-200 hover:scale-[1.02] focus:ring-2"
        style={{
          backgroundColor: "var(--bg-user-msg)",
          color: "var(--text-primary)",
          borderColor: "var(--border-color)",
        }}
      >
        {ALL_CITIES.map((city) => (
          <option
            key={city}
            value={city}
            style={{ backgroundColor: "var(--bg-user-msg)" }}
          >
            {CITY_LABELS[city]}
          </option>
        ))}
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute right-2 h-4 w-4 opacity-60"
        style={{ color: "var(--text-primary)" }}
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
