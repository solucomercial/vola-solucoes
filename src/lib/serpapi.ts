import { FlightResult, HotelProperty } from "@/types/travel";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function searchFlights(params: {
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  return_date?: string;
  currency?: string;
}) {
  const searchParams = new URLSearchParams({
    engine: "google_flights",
    api_key: SERPAPI_KEY!,
    hl: "pt", // Idioma em português [10]
    gl: "br", // Localização Brasil [10]
    currency: params.currency || "BRL", // Moeda padrão Real [11]
    ...params,
  });

  const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Erro ao buscar voos");
  const data = await response.json();
  
  // Retorna os melhores voos e outras opções encontradas [12, 13]
  return {
    best_flights: data.best_flights || [],
    other_flights: data.other_flights || [],
    price_insights: data.price_insights // Dados de tendências de preço [14]
  };
}

export async function searchHotels(params: {
  q: string;
  check_in_date: string;
  check_out_date: string;
  adults?: number;
}) {
  const searchParams = new URLSearchParams({
    engine: "google_hotels",
    api_key: SERPAPI_KEY!,
    hl: "pt",
    gl: "br",
    currency: "BRL",
    ...params,
    adults: params.adults?.toString() || "1",
  });

  const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Erro ao buscar hotéis");
  const data = await response.json();

  // Retorna a lista de propriedades (hotéis) [15, 16]
  return data.properties || [];
}