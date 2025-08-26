"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react"

interface DualListBoxProps {
  label: string
  availableItems: string[]
  selectedItems: string[]
  onSelectionChange: (selected: string[]) => void
  height?: string
}

export function DualListBox({
  label,
  availableItems,
  selectedItems,
  onSelectionChange,
  height = "200px",
}: DualListBoxProps) {
  const [availableSelected, setAvailableSelected] = useState<string[]>([])
  const [selectedSelected, setSelectedSelected] = useState<string[]>([])

  const available = availableItems.filter((item) => !selectedItems.includes(item))

  const moveToSelected = () => {
    const newSelected = [...selectedItems, ...availableSelected]
    onSelectionChange(newSelected)
    setAvailableSelected([])
  }

  const moveToAvailable = () => {
    const newSelected = selectedItems.filter((item) => !selectedSelected.includes(item))
    onSelectionChange(newSelected)
    setSelectedSelected([])
  }

  const moveAllToSelected = () => {
    onSelectionChange([...selectedItems, ...available])
  }

  const moveAllToAvailable = () => {
    onSelectionChange([])
    setSelectedSelected([])
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-5 gap-2 items-center">
        {/* Lista Disponible */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Disponible</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <select
              multiple
              className="w-full border rounded p-2 text-sm"
              style={{ height }}
              value={availableSelected}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                setAvailableSelected(values)
              }}
            >
              {available.map((item) => (
                <option key={item} value={item} className="p-1">
                  {item}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Botones de Control */}
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={moveToSelected}
            disabled={availableSelected.length === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={moveAllToSelected}
            disabled={available.length === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={moveToAvailable}
            disabled={selectedSelected.length === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={moveAllToAvailable}
            disabled={selectedItems.length === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista Seleccionada */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Seleccionado</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <select
              multiple
              className="w-full border rounded p-2 text-sm"
              style={{ height }}
              value={selectedSelected}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                setSelectedSelected(values)
              }}
            >
              {selectedItems.map((item) => (
                <option key={item} value={item} className="p-1">
                  {item}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
