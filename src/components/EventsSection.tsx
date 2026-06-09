"use client";

import { useEffect, useState } from "react";
import { City, HubEvent, CITY_LABELS } from "@/types";
import { EventCard } from "./EventCard";

interface EventsSectionProps {
  city: City;
}

export function EventsSection({ city }: EventsSectionProps) {
  const [events, setEvents] = useState<HubEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/events?city=${encodeURIComponent(city)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return (await res.json()) as { events: HubEvent[] };
      })
      .then((data) => {
        if (!cancelled) setEvents(data.events ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Ошибка загрузки");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <section className="w-full">
      <h2
        className="mb-4 text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--text-primary)" }}
      >
        🎉 Ближайшие события · {CITY_LABELS[city]}
      </h2>

      {loading ? (
        <p
          className="text-sm opacity-70"
          style={{ color: "var(--text-primary)" }}
        >
          Загружаем события...
        </p>
      ) : error ? (
        <p
          className="text-sm opacity-70"
          style={{ color: "var(--text-primary)" }}
        >
          Не удалось загрузить события: {error}
        </p>
      ) : events.length === 0 ? (
        <p
          className="text-sm opacity-70"
          style={{ color: "var(--text-primary)" }}
        >
          В этом городе пока нет событий
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={{
                id: event.id,
                title: event.title,
                date: event.date,
                time: event.time,
                format: event.format,
                address: event.address,
                description: event.description,
              }}
              href={event.url}
            />
          ))}
        </div>
      )}
    </section>
  );
}
