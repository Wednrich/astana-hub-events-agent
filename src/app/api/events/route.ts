import { NextRequest, NextResponse } from "next/server";
import { ALL_CITIES, type City } from "@/types";
import { getAllEvents, getEventsByCity } from "@/data/eventLoader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidCity(c: string): c is City {
  return (ALL_CITIES as string[]).includes(c);
}

// GET /api/events?city=Astana  (or no city → all)
export async function GET(req: NextRequest) {
  const cityParam = req.nextUrl.searchParams.get("city");

  if (!cityParam) {
    const events = getAllEvents();
    return NextResponse.json({
      city: null,
      count: events.length,
      events,
    });
  }

  if (!isValidCity(cityParam)) {
    return NextResponse.json(
      {
        error: `Неизвестный город: ${cityParam}. Допустимо: ${ALL_CITIES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const events = getEventsByCity(cityParam);
  return NextResponse.json({
    city: cityParam,
    count: events.length,
    events,
  });
}
