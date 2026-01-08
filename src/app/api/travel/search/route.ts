import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // "flight", "hotel" ou "car"
  const apiKey = process.env.SERPAPI_API_KEY;

  try {
    let engine = "google_flights";
    let params: any = { api_key: apiKey, hl: "pt", gl: "br", currency: "BRL" };

    if (type === "flight") {
      params = { ...params, engine: "google_flights", departure_id: searchParams.get('origin'), arrival_id: searchParams.get('destination'), outbound_date: searchParams.get('date'), type: searchParams.get('tripType') === "round-trip" ? 1 : 2 };
    } else if (type === "hotel") {
      params = { ...params, engine: "google_hotels", q: searchParams.get('q'), check_in_date: searchParams.get('checkIn'), check_out_date: searchParams.get('checkOut') };
    } else {
      // Para carros, usamos o motor de busca geral do Google
      params = { ...params, engine: "google", q: `aluguel de carros em ${searchParams.get('q')}` };
    }

    const response = await fetch(`https://serpapi.com/search?${new URLSearchParams(params)}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro na API" }, { status: 500 });
  }
}