
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/popover"
import { searchComuni, searchProvince, Comune, Province } from "@/lib/data/geo-utils"

interface MunicipalityAutocompleteProps {
    value?: string;
    onSelect: (comune: Comune) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

export function MunicipalityAutocomplete({ value, onSelect, disabled, className, placeholder = "Cerca comune..." }: MunicipalityAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    // If value is provided externally, we might want to sync it? 
    // Usually for an autocomplete, the input should show the value.
    // simpler: show the value in the button.

    // Fetch suggestions based on inputValue
    // We only filter if open is true
    const suggestions = React.useMemo(() => {
        if (!open) return [];
        return searchComuni(inputValue)
    }, [inputValue, open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={placeholder}
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>Nessun comune trovato.</CommandEmpty>
                        <CommandGroup>
                            {suggestions.map((comune) => (
                                <CommandItem
                                    key={comune.codice}
                                    value={comune.nome}
                                    onSelect={() => {
                                        onSelect(comune)
                                        setOpen(false)
                                        setInputValue("") // Reset search or keep it? Reset is usually better after selection.
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === comune.nome ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{comune.nome}</span>
                                        <span className="text-xs text-muted-foreground">{comune.provincia.nome} ({comune.sigla})</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

interface ProvinceAutocompleteProps {
    value?: string;
    onSelect: (province: Province) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

export function ProvinceAutocomplete({ value, onSelect, disabled, className, placeholder = "Cerca provincia..." }: ProvinceAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const suggestions = React.useMemo(() => {
        if (!open) return [];
        return searchProvince(inputValue)
    }, [inputValue, open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={placeholder}
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>Nessuna provincia trovata.</CommandEmpty>
                        <CommandGroup>
                            {suggestions.map((prov) => (
                                <CommandItem
                                    key={prov.sigla}
                                    value={prov.sigla + " " + prov.nome} // Value for filtering check? No we filter manually.
                                    onSelect={() => {
                                        onSelect(prov)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === prov.sigla ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span>{prov.nome} ({prov.sigla})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
