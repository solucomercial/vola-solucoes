"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Search, Plane, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface Flight {
  id: string
  airline: string
  flight_number: string
  origin: string
  destination: string
  departure_time: string
  arrival_time: string
  price: number
  seats_available: number
}

interface FlightSearchFormProps {
  userId: string
}

export function FlightSearchForm({ userId }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way")
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
  })
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [reason, setReason] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)
    setFlights([])
    setSelectedFlight(null)

    try {
      const departureDate = new Date(searchParams.departureDate)

      const query = supabase
        .from("flights")
        .select("*")
        .ilike("origin", `%${searchParams.origin}%`)
        .ilike("destination", `%${searchParams.destination}%`)
        .gte("departure_time", departureDate.toISOString())
        .gte("seats_available", searchParams.passengers)
        .order("departure_time", { ascending: true })

      const { data, error } = await query

      if (error) throw error

      if (!data || data.length === 0) {
        setError("No flights found for your search criteria")
      } else {
        setFlights(data as Flight[])
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred while searching")
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!selectedFlight || !reason.trim()) {
      setError("Please select a flight and provide a reason for your request")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase.from("flight_requests").insert({
        user_id: userId,
        flight_id: selectedFlight.id,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        departure_date: new Date(selectedFlight.departure_time).toISOString().split("T")[0],
        return_date: tripType === "round-trip" && searchParams.returnDate ? searchParams.returnDate : null,
        trip_type: tripType,
        passengers: searchParams.passengers,
        reason: reason,
        total_price: selectedFlight.price * searchParams.passengers,
        status: "pending",
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/requests")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred while creating request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
          <CardDescription>Enter your travel details to find available flights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            <RadioGroup value={tripType} onValueChange={(value) => setTripType(value as "one-way" | "round-trip")}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-way" id="one-way" />
                  <Label htmlFor="one-way">One way</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="round-trip" id="round-trip" />
                  <Label htmlFor="round-trip">Round trip</Label>
                </div>
              </div>
            </RadioGroup>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="origin">From</Label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="origin"
                    placeholder="São Paulo (GRU)"
                    className="pl-9"
                    required
                    value={searchParams.origin}
                    onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">To</Label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="Rio de Janeiro (GIG)"
                    className="pl-9"
                    required
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="departureDate"
                    type="date"
                    className="pl-9"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={searchParams.departureDate}
                    onChange={(e) => setSearchParams({ ...searchParams, departureDate: e.target.value })}
                  />
                </div>
              </div>
              {tripType === "round-trip" && (
                <div className="grid gap-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="returnDate"
                      type="date"
                      className="pl-9"
                      min={searchParams.departureDate || new Date().toISOString().split("T")[0]}
                      value={searchParams.returnDate}
                      onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passengers">Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max="9"
                  className="pl-9"
                  required
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({ ...searchParams, passengers: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            {error && !flights.length && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSearching} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Searching..." : "Search Flights"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {flights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Flights</CardTitle>
            <CardDescription>Select a flight to create your request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {flights.map((flight) => (
                <button
                  key={flight.id}
                  onClick={() => setSelectedFlight(flight)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                    selectedFlight?.id === flight.id ? "border-primary bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{flight.airline}</span>
                        <span className="text-sm text-muted-foreground">{flight.flight_number}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="font-medium">
                            {new Date(flight.departure_time).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-muted-foreground">{flight.origin}</p>
                        </div>
                        <div className="flex-1 border-t border-dashed" />
                        <div className="text-right">
                          <p className="font-medium">
                            {new Date(flight.arrival_time).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-muted-foreground">{flight.destination}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-2xl font-bold">R$ {flight.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{flight.seats_available} seats left</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFlight && (
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Provide a reason for your travel request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{selectedFlight.airline}</span>
                  <span className="text-2xl font-bold">
                    R$ {(selectedFlight.price * searchParams.passengers).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight.origin} → {selectedFlight.destination} • {searchParams.passengers} passenger(s)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Travel</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Client meeting, Conference attendance, Site visit..."
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>Request created successfully! Redirecting...</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCreateRequest} disabled={isSubmitting || success} className="w-full" size="lg">
                {isSubmitting ? "Creating Request..." : "Create Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
