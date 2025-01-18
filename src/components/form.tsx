'use client';

import { summarizeStockData } from '@/app/actions';
import { PlusCircle } from 'lucide-react';
import { useState, useTransition } from 'react';

export const Form = () => {
  const [currStockSymbol, setCurrStockSymbol] = useState<string>('');
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const areSymbolsEmpty = stockSymbols.length === 0;

  const isNotPendingButtonText = areSymbolsEmpty ? 'Add at least one symbol' : 'Get Oportunities ';

  const isSubmtiButtonDisabled = areSymbolsEmpty || isPending;

  const hasUserReachedSymbolsLimit = stockSymbols.length === 3;

  const symbolCannotBeAdded =
    stockSymbols.includes(currStockSymbol) || !currStockSymbol || hasUserReachedSymbolsLimit;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      const response = await summarizeStockData({
        stockSymbols,
      });
      if (error) {
        setError(error);
        return;
      }

      setSummary(response.summary);
    });
  };

  const handleResetSummary = () => {
    setSummary(null);
    setStockSymbols([]);
  };

  const handleAddSymbol = () => {
    if (symbolCannotBeAdded) {
      return;
    }

    setStockSymbols([...stockSymbols, currStockSymbol]);
    setCurrStockSymbol('');
  };

  const handleCurrSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrStockSymbol(e.target.value);
  };
  return (
    <section className="flex flex-col items-center">
      {!isPending && summary ? (
        <section className="flex flex-col items-center max-w-md space-y-4 mt-4">
          <h3 className="text-xl text-center font-normal">
            Report generated from the data of the following actions:{' '}
            <span className="font-semibold">{stockSymbols.join(', ')} </span>
          </h3>
          <p className="text-center text-lg border p-4 rounded-lg bg-zinc-100 max-h-96 overflow-y-auto">
            {summary}
          </p>
          <button
            onClick={handleResetSummary}
            className="px-8 py-2  rounded-lg border bg-blue-400 hover:bg-blue-500 transition-colors text-lg font-semibold"
          >
            Get another opportunities
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <label htmlFor="stock-symbol" className="block mb-4 mt-6 text-lg text-center">
            Enter at least 1 stock symbol, up to 3 symbols
          </label>
          <div className="flex items-center gap-2">
            <input
              onChange={handleCurrSymbolChange}
              value={currStockSymbol}
              name="stock-symbol"
              id="stock-symbol"
              className="border rounded-lg px-4 py-2"
              type="text"
              placeholder="NVDA"
            />
            <button onClick={handleAddSymbol} disabled={symbolCannotBeAdded}>
              <PlusCircle
                className={`transition-transform ${
                  symbolCannotBeAdded ? 'stroke-zinc-200 cursor-not-allowed' : 'hover:scale-110'
                } `}
              />
            </button>
          </div>
          <ol className="space-y-2 mt-2">
            {stockSymbols.map((symbol, index) => (
              <li
                className="px-10 py-2 rounded-lg bg-zinc-200 font-bold flex justify-between"
                key={index}
              >
                {symbol}
              </li>
            ))}
          </ol>
          <button
            className="mt-4 font-semibold px-8 py-2 rounded-lg border bg-blue-400 hover:bg-blue-500 transition-colors disabled:bg-zinc-200 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmtiButtonDisabled}
          >
            {isPending ? 'Getting opportunities...' : isNotPendingButtonText}
          </button>
        </form>
      )}
      {}

      {error && (
        <p className="mt-10 text-center max-w-md text-lg text-red-500">
          Something went wrong please try again later
        </p>
      )}
    </section>
  );
};
