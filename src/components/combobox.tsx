'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const stocks = [
  {
    value: 'NVDA',
    label: 'NVIDIA',
  },
  {
    value: 'AAPL',
    label: 'Apple',
  },
  {
    value: 'TSLA',
    label: 'Tesla',
  },
  {
    value: 'GOOGL',
    label: 'Alphabet',
  },
  {
    value: 'AMZN',
    label: 'Amazon',
  },
  {
    value: 'MSFT',
    label: 'Microsoft',
  },
  {
    value: 'FB',
    label: 'Facebook',
  },
];

type Props = {
  value: string;
  updateValue: (value: string) => void;
};

export function ComboboxDemo({ value, updateValue }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? stocks.find((stock) => stock.value === value)?.label : 'Select a stock...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search a stock..." />
          <CommandList>
            <CommandEmpty>No stock found.</CommandEmpty>
            <CommandGroup>
              {stocks.map((stock) => (
                <CommandItem
                  key={stock.value}
                  value={stock.value}
                  onSelect={(currentValue) => {
                    updateValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === stock.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {stock.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
