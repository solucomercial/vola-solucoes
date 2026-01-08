"use client"

import * as React from "react"
import { useState } from "react"
import { Search, Plane, Hotel, ExternalLink, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { AirportCombobox } from "./airport-combobox"

export function FlightSearchForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState("flights")
  const [flights, setFlights] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [flightParams, setFlightParams] = useState({ 
    origin: "", destination: "", departureDate: "", returnDate: "", passengers: 1 
  })
  const [hotelParams, setHotelParams] = useState({ 
    location: "", checkIn: "", checkOut: "" 
  })

  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)
    setFlights([])

    try {
      const res = await fetch(`/api/search?type=flight&origin=${flightParams.origin}&destination=${flightParams.destination}&departureDate=${flightParams.departureDate}&returnDate=${flightParams.returnDate}&adults=${flightParams.passengers}`)
      const data = await res.json()
      if (data.length > 0) setFlights(data)
      else setError("Nenhum voo encontrado para esta data.")
    } catch {
      setError("Erro ao conectar com o serviço de busca.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setHotels([])

    try {
      const res = await fetch(`/api/search?type=hotel&q=${hotelParams.location}&checkIn=${hotelParams.checkIn}&checkOut=${hotelParams.checkOut}`)
      const data = await res.json()
      setHotels(data)
    } catch {
      setError("Erro ao buscar hotéis.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!selectedFlight || !reason) return
    // Lógica de salvamento no Supabase (conforme discutido anteriormente)
    const { data: flight } = await supabase.from("flights").insert({
      airline: selectedFlight.airline,
      flight_number: selectedFlight.flight_number,
      origin: selectedFlight.origin,
      destination: selectedFlight.destination,
      departure_time: selectedFlight.departure_time,
      arrival_time: selectedFlight.arrival_time,
      price: selectedFlight.price,
      seats_available: 1
    }).select().single()

    await supabase.from("flight_requests").insert({
      user_id: userId,
      flight_id: flight.id,
      origin: flight.origin,
      destination: flight.destination,
      departure_date: flightParams.departureDate,
      reason,
      total_price: selectedFlight.price * flightParams.passengers,
      status: "pending"
    })
    router.push("/requests")
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="flights" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="flights" className="gap-2"><Plane className="h-4 w-4"/> Voos</TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2"><Hotel className="h-4 w-4"/> Hotéis</TabsTrigger>
        </TabsList>

        <TabsContent value="flights">
          <Card>
            <CardHeader><CardTitle>Buscar Voos Reais</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleFlightSearch} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <AirportCombobox value={flightParams.origin} onChange={(v) => setFlightParams({...flightParams, origin: v})} placeholder="Origem" />
                  <AirportCombobox value={flightParams.destination} onChange={(v) => setFlightParams({...flightParams, destination: v})} placeholder="Destino" />
                </div>
                <Input type="date" value={flightParams.departureDate} onChange={(e) => setFlightParams({...flightParams, departureDate: e.target.value})} />
                <Button type="submit" disabled={isSearching} className="w-full">
                  {isSearching ? "Buscando..." : "Buscar Passagens"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels">
          <Card>
            <CardHeader><CardTitle>Buscar Hotéis</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleHotelSearch} className="grid gap-4">
                <Input placeholder="Cidade ou Hotel" value={hotelParams.location} onChange={(e) => setHotelParams({...hotelParams, location: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={hotelParams.checkIn} onChange={(e) => setHotelParams({...hotelParams, checkIn: e.target.value})} />
                  <Input type="date" value={hotelParams.checkOut} onChange={(e) => setHotelParams({...hotelParams, checkOut: e.target.value})} />
                </div>
                <Button type="submit" variant="secondary" className="w-full">Buscar Hotéis</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RENDERIZAÇÃO DE VOOS */}
      {flights.length > 0 && (
        <div className="grid gap-3">
          {flights.map((f) => (
            <button key={f.id} onClick={() => setSelectedFlight(f)} className={cn("p-4 border rounded-xl text-left hover:bg-muted", selectedFlight?.id === f.id && "border-primary bg-primary/5")}>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  {f.airline_logo && <img src={f.airline_logo} className="h-8 w-8 object-contain" />}
                  <div>
                    <p className="font-bold">{f.airline} <span className="text-xs font-normal opacity-50">({f.flight_number})</span></p>
                    <p className="text-sm">{f.origin} → {f.destination}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-primary">R$ {f.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* RENDERIZAÇÃO DE HOTÉIS COM BOTÃO DE RESERVA EXTERNA */}
      {hotels.length > 0 && (activeTab === "hotels") && (
        <div className="grid md:grid-cols-2 gap-4">
          {hotels.map((h) => (
            <Card key={h.property_token} className="overflow-hidden flex flex-col">
              <div className="h-40 bg-muted">
                {h.images?.[0] && <img src={h.images[0].thumbnail} className="w-full h-full object-cover" />}
              </div>
              <CardHeader className="p-4 flex-1">
                <CardTitle className="text-base">{h.name}</CardTitle>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-primary">{h.rate_per_night?.lowest || "Sob consulta"}</span>
                  <Badge variant="secondary">{h.overall_rating} ★</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(h.link, "_blank")}>
                  Reservar no Site <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedFlight && activeTab === "flights" && (
        <Card className="border-primary/30 mt-4">
          <CardContent className="pt-6 grid gap-4">
            <Textarea placeholder="Descreva o motivo da viagem corporativa..." value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button onClick={handleCreateRequest} className="w-full h-12 text-lg">Enviar para Aprovação</Button>
          </CardContent>
        </Card>
      )}

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
    </div>
  )
}