"use client"

import * as React from "react"
import { useState } from "react"
import { Plane, Hotel, Check, ChevronDown } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { AirportCombobox } from "./airport-combobox"

export function FlightSearchForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  
  // Estados de Controle de Interface
  const [activeTab, setActiveTab] = useState("flights")
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way")
  const [includeHotel, setIncludeHotel] = useState(false)
  const [visibleFlights, setVisibleFlights] = useState(5)
  
  // Estados de Dados
  const [flights, setFlights] = useState<any[]>([])
  const [returnFlights, setReturnFlights] = useState<any[]>([]) // Voos de volta
  const [hotels, setHotels] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Seleções do Usuário
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<any>(null)
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<any>(null)
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
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
    setReturnFlights([])
    setSelectedDepartureFlight(null)
    setSelectedReturnFlight(null)
    setVisibleFlights(5)

    try {
      // Busca de Ida
      const queryIda = new URLSearchParams({
        type: 'flight',
        origin: flightParams.origin,
        destination: flightParams.destination,
        departureDate: flightParams.departureDate,
        adults: flightParams.passengers.toString()
      })
      
      const resIda = await fetch(`/api/search?${queryIda}`)
      const dataIda = await resIda.json()
      
      if (dataIda.length > 0) {
        setFlights(dataIda)
        
        // Se for ida e volta, busca os voos de retorno invertendo origem/destino
        if (tripType === "round-trip") {
          const queryVolta = new URLSearchParams({
            type: 'flight',
            origin: flightParams.destination,
            destination: flightParams.origin,
            departureDate: flightParams.returnDate,
            adults: flightParams.passengers.toString()
          })
          const resVolta = await fetch(`/api/search?${queryVolta}`)
          const dataVolta = await resVolta.json()
          setReturnFlights(dataVolta)
        }
      } else {
        setError("Nenhum voo encontrado para os critérios selecionados.")
      }
    } catch {
      setError("Erro ao conectar com o serviço de busca de passagens.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!selectedDepartureFlight) {
      setError("Por favor, selecione o voo de ida.")
      return
    }
    if (tripType === "round-trip" && !selectedReturnFlight) {
      setError("Por favor, selecione o voo de volta.")
      return
    }
    if (includeHotel && !selectedHotel) {
      setError("Você optou por hotel, mas não selecionou uma opção.")
      return
    }
    if (!reason) {
      setError("O motivo da viagem é obrigatório.")
      return
    }

    try {
      // Salva o voo de ida
      const { data: flight, error: flightErr } = await supabase.from("flights").insert({
        airline: selectedDepartureFlight.airline,
        flight_number: selectedDepartureFlight.flight_number,
        origin: selectedDepartureFlight.origin,
        destination: selectedDepartureFlight.destination,
        departure_time: selectedDepartureFlight.departure_time,
        price: selectedDepartureFlight.price,
      }).select().single()

      if (flightErr) throw flightErr

      const flightPriceTotal = (selectedDepartureFlight.price + (selectedReturnFlight?.price || 0)) * flightParams.passengers
      const hotelPrice = selectedHotel?.rate_per_night?.lowest_extracted || 0

      const { error: requestErr } = await supabase.from("flight_requests").insert({
        user_id: userId,
        flight_id: flight.id,
        origin: flightParams.origin,
        destination: flightParams.destination,
        departure_date: flightParams.departureDate,
        return_date: tripType === "round-trip" ? flightParams.returnDate : null,
        is_round_trip: tripType === "round-trip",
        include_hotel: includeHotel,
        passengers_count: flightParams.passengers,
        hotel_info: selectedHotel ? { name: selectedHotel.name, link: selectedHotel.link } : null,
        return_flight_info: selectedReturnFlight ? { 
          airline: selectedReturnFlight.airline, 
          flight_number: selectedReturnFlight.flight_number 
        } : null,
        reason,
        total_price: flightPriceTotal + hotelPrice,
        status: "pending"
      })

      if (requestErr) throw requestErr
      router.push("/requests")
    } catch (err) {
      setError("Erro ao salvar solicitação. Verifique os dados e tente novamente.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="flights" className="gap-2">
            <Plane className="h-4 w-4"/> Voos {(selectedDepartureFlight && (tripType === 'one-way' || selectedReturnFlight)) && <Check className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2" disabled={!includeHotel}>
            <Hotel className="h-4 w-4"/> Hotéis {selectedHotel && <Check className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>Encontrar Passagens Aéreas</CardTitle>
              <CardDescription>Pesquise voos nacionais e internacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFlightSearch} className="grid gap-4">
                <div className="flex flex-wrap justify-between items-end gap-4">
                  <RadioGroup defaultValue="one-way" onValueChange={(v) => setTripType(v as any)} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="one-way" id="one-way" /><Label htmlFor="one-way">Somente Ida</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="round-trip" id="round-trip" /><Label htmlFor="round-trip">Ida e Volta</Label></div>
                  </RadioGroup>
                  
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <Label htmlFor="passengers">Passageiros</Label>
                    <Input id="passengers" type="number" min={1} max={10} value={flightParams.passengers} onChange={(e) => setFlightParams({...flightParams, passengers: parseInt(e.target.value)})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Origem</Label><AirportCombobox value={flightParams.origin} onChange={(v) => setFlightParams({...flightParams, origin: v})} placeholder="Saindo de..." /></div>
                  <div className="space-y-2"><Label>Destino</Label><AirportCombobox value={flightParams.destination} onChange={(v) => setFlightParams({...flightParams, destination: v})} placeholder="Indo para..." /></div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Data de Ida</Label><Input type="date" value={flightParams.departureDate} onChange={(e) => setFlightParams({...flightParams, departureDate: e.target.value})} /></div>
                  {tripType === "round-trip" && (
                    <div className="space-y-2"><Label>Data de Volta</Label><Input type="date" value={flightParams.returnDate} onChange={(e) => setFlightParams({...flightParams, returnDate: e.target.value})} /></div>
                  )}
                </div>

                <div className="flex items-center space-x-2 p-3 bg-muted/40 rounded-lg border">
                  <Checkbox id="includeHotel" checked={includeHotel} onCheckedChange={(checked) => setIncludeHotel(!!checked)} />
                  <Label htmlFor="includeHotel" className="cursor-pointer text-sm font-medium">Incluir reserva de hotel nesta solicitação</Label>
                </div>

                <Button type="submit" disabled={isSearching} className="w-full h-11">{isSearching ? "Pesquisando..." : "Buscar Passagens"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* LISTAGEM DE VOOS DE IDA */}
      {activeTab === "flights" && flights.length > 0 && (
        <div className="grid gap-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-bold">1. Selecione o voo de IDA</Label>
            {selectedDepartureFlight && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Selecionado</Badge>}
          </div>
          {flights.slice(0, visibleFlights).map((f) => (
            <button key={f.id} onClick={() => setSelectedDepartureFlight(f)} className={cn("p-4 border rounded-xl text-left transition-all hover:shadow-sm", selectedDepartureFlight?.id === f.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card")}>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  {f.airline_logo && <img src={f.airline_logo} className="h-10 w-10 object-contain" alt="Logo" />}
                  <div>
                    <p className="font-bold">{f.airline}</p>
                    <p className="text-sm text-muted-foreground">{f.origin} → {f.destination}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-primary">R$ {f.price}</p>
              </div>
            </button>
          ))}
          
          {/* LISTAGEM DE VOOS DE VOLTA */}
          {tripType === "round-trip" && returnFlights.length > 0 && (
            <div className="mt-6 grid gap-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-bold">2. Selecione o voo de VOLTA</Label>
                {selectedReturnFlight && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Selecionado</Badge>}
              </div>
              {returnFlights.slice(0, visibleFlights).map((f) => (
                <button key={`ret-${f.id}`} onClick={() => setSelectedReturnFlight(f)} className={cn("p-4 border rounded-xl text-left transition-all hover:shadow-sm", selectedReturnFlight?.id === f.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card")}>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      {f.airline_logo && <img src={f.airline_logo} className="h-10 w-10 object-contain" alt="Logo" />}
                      <div><p className="font-bold">{f.airline}</p><p className="text-sm text-muted-foreground">{f.origin} → {f.destination}</p></div>
                    </div>
                    <p className="text-xl font-bold text-primary">R$ {f.price}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* BOTÃO VER MAIS */}
          {(flights.length > visibleFlights || returnFlights.length > visibleFlights) && (
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => setVisibleFlights(prev => prev + 5)}>
              Veja mais opções <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* RESUMO E ENVIO FINAL (EM PORTUGUÊS) */}
      {(selectedDepartureFlight || selectedHotel) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 grid gap-4">
            <div className="space-y-3">
              <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Resumo da Viagem</p>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span>Voo de Ida:</span> <span className="font-medium">{selectedDepartureFlight?.airline || "Não selecionado"}</span></div>
                {tripType === "round-trip" && <div className="flex justify-between"><span>Voo de Volta:</span> <span className="font-medium">{selectedReturnFlight?.airline || "Não selecionado"}</span></div>}
                {includeHotel && <div className="flex justify-between"><span>Hotel:</span> <span className="font-medium">{selectedHotel?.name || "Pendente seleção"}</span></div>}
                <div className="flex justify-between border-t pt-2 font-bold text-primary"><span>Total Estimado:</span> <span>R$ {((selectedDepartureFlight?.price || 0) + (selectedReturnFlight?.price || 0)) * flightParams.passengers + (selectedHotel?.rate_per_night?.lowest_extracted || 0)}</span></div>
              </div>
            </div>
            <Textarea placeholder="Descreva o motivo desta viagem de trabalho..." value={reason} onChange={(e) => setReason(e.target.value)} className="bg-background" />
            <Button onClick={handleCreateRequest} className="w-full h-12 text-lg font-semibold" disabled={includeHotel && !selectedHotel}>Enviar para Aprovação</Button>
          </CardContent>
        </Card>
      )}

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
    </div>
  )
}