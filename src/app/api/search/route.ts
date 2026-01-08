import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "API Key ausente" }, { status: 500 });

  try {
    if (type === 'flight') {
      const params = new URLSearchParams({
        engine: "google_flights",
        api_key: apiKey,
        departure_id: searchParams.get('origin') || '',
        arrival_id: searchParams.get('destination') || '',
        outbound_date: searchParams.get('departureDate') || '',
        return_date: searchParams.get('returnDate') || '',
        type: searchParams.get('returnDate') ? "1" : "2", // 1=Ida/Volta, 2=Só Ida
        currency: "BRL",
        hl: "pt",
      });

      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      const data = await response.json();

      // Unimos best_flights e other_flights para garantir que a tela não fique vazia
      const rawFlights = [...(data.best_flights || []), ...(data.other_flights || [])];

      const mappedFlights = rawFlights.map((f: any) => ({
        id: f.booking_token || Math.random().toString(),
        airline: f.flights?.[0]?.airline || "Cia Aérea",
        airline_logo: f.flights?.[0]?.airline_logo,
        flight_number: f.flights?.[0]?.flight_number || "N/A",
        origin: f.flights?.[0]?.departure_airport?.id,
        destination: f.flights?.[0]?.arrival_airport?.id,
        departure_time: f.flights?.[0]?.departure_airport?.time,
        arrival_time: f.flights?.[0]?.arrival_airport?.time,
        price: typeof f.price === 'number' ? f.price : 0,
      }));

      return NextResponse.json(mappedFlights);
    }

    if (type === 'hotel') {
      const params = new URLSearchParams({
        engine: "google_hotels",
        api_key: apiKey,
        q: searchParams.get('q') || '',
        check_in_date: searchParams.get('checkIn') || '',
        check_out_date: searchParams.get('checkOut') || '',
        currency: "BRL",
        hl: "pt",
      });

      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      const data = await response.json();
      
      // Retornamos 'properties' que contém o link de reserva
      return NextResponse.json(data.properties || []);
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}