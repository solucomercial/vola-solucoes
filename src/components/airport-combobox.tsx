"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils" //
import { Button } from "@/components/ui/button" //
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover" //

const AIRPORTS_BY_STATE = [
  { state: "Acre", airports: [{ label: "Rio Branco - RBR", value: "RBR" }] },
  { state: "Alagoas", airports: [{ label: "Maceió - MCZ", value: "MCZ" }] },
  { state: "Amapá", airports: [{ label: "Macapá - MCP", value: "MCP" }] },
  { state: "Amazonas", airports: [{ label: "Manaus - MAO", value: "MAO" }] },
  { state: "Bahia", airports: [
    { label: "Salvador - SSA", value: "SSA" },
    { label: "Porto Seguro - BPS", value: "BPS" },
    { label: "Vitória da Conquista - VDC", value: "VDC" },
    { label: "Ilhéus - IOS", value: "IOS" },
  ]},
  { state: "Ceará", airports: [
    { label: "Fortaleza - FOR", value: "FOR" },
    { label: "Juazeiro do Norte - JDO", value: "JDO" },
  ]},
  { state: "Distrito Federal", airports: [{ label: "Brasília - BSB", value: "BSB" }] },
  { state: "Espírito Santo", airports: [{ label: "Vitória - VIX", value: "VIX" }] },
  { state: "Goiás", airports: [{ label: "Goiânia - GYN", value: "GYN" }] },
  { state: "Maranhão", airports: [
    { label: "São Luís - SLZ", value: "SLZ" },
    { label: "Imperatriz - IMP", value: "IMP" },
  ]},
  { state: "Mato Grosso", airports: [{ label: "Cuiabá - CGB", value: "CGB" }] },
  { state: "Mato Grosso do Sul", airports: [{ label: "Campo Grande - CGR", value: "CGR" }] },
  { state: "Minas Gerais", airports: [
    { label: "Belo Horizonte (Confins) - CNF", value: "CNF" },
    { label: "Uberlândia - UDI", value: "UDI" },
  ]},
  { state: "Pará", airports: [{ label: "Belém - BEL", value: "BEL" }] },
  { state: "Paraíba", airports: [{ label: "João Pessoa - JPA", value: "JPA" }] },
  { state: "Paraná", airports: [
    { label: "Curitiba - CWB", value: "CWB" },
    { label: "Foz do Iguaçu - IGU", value: "IGU" },
    { label: "Londrina - LDB", value: "LDB" },
    { label: "Maringá - MGF", value: "MGF" },
  ]},
  { state: "Pernambuco", airports: [
    { label: "Recife - REC", value: "REC" },
    { label: "Petrolina - PNZ", value: "PNZ" },
  ]},
  { state: "Piauí", airports: [{ label: "Teresina - THE", value: "THE" }] },
  { state: "Rio de Janeiro", airports: [
    { label: "Rio de Janeiro (Todos) - RIO", value: "RIO" },
    { label: "Galeão - GIG", value: "GIG" },
    { label: "Santos Dumont - SDU", value: "SDU" },
  ]},
  { state: "Rio Grande do Norte", airports: [{ label: "Natal - NAT", value: "NAT" }] },
  { state: "Rio Grande do Sul", airports: [
    { label: "Porto Alegre - POA", value: "POA" },
    { label: "Caxias do Sul - CXJ", value: "CXJ" },
    { label: "Passo Fundo - PFB", value: "PFB" },
  ]},
  { state: "Rondônia", airports: [{ label: "Porto Velho - PVH", value: "PVH" }] },
  { state: "Roraima", airports: [{ label: "Boa Vista - BVB", value: "BVB" }] },
  { state: "Santa Catarina", airports: [
    { label: "Florianópolis - FLN", value: "FLN" },
    { label: "Navegantes - NVT", value: "NVT" },
    { label: "Joinville - JOI", value: "JOI" },
    { label: "Chapecó - XAP", value: "XAP" },
  ]},
  { state: "São Paulo", airports: [
    { label: "São Paulo (Todos) - SAO", value: "SAO" },
    { label: "Guarulhos - GRU", value: "GRU" },
    { label: "Congonhas - CGH", value: "CGH" },
    { label: "Campinas - VCP", value: "VCP" },
    { label: "Ribeirão Preto - RAO", value: "RAO" },
    { label: "São José do Rio Preto - SJP", value: "SJP" },
  ]},
  { state: "Sergipe", airports: [{ label: "Aracaju - AJU", value: "AJU" }] },
  { state: "Tocantins", airports: [{ label: "Palmas - PMW", value: "PMW" }] },
].sort((a, b) => a.state.localeCompare(b.state));

interface AirportComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function AirportCombobox({ value, onChange, placeholder }: AirportComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedLabel = AIRPORTS_BY_STATE.flatMap(s => s.airports).find(a => a.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value ? selectedLabel : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Busque por estado ou cidade..." />
          <CommandList>
            <CommandEmpty>Local não encontrado.</CommandEmpty>
            {AIRPORTS_BY_STATE.map((group) => (
              <CommandGroup key={group.state} heading={group.state}>
                {group.airports.map((airport) => (
                  <CommandItem
                    key={airport.value}
                    value={airport.label}
                    onSelect={() => {
                      onChange(airport.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === airport.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {airport.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}