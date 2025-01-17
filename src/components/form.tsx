'use client';

import { summarizeStockData } from '@/app/actions';
import { useState, useTransition } from 'react';

export const Form = () => {
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isNotPendingButtonText = stockSymbols.length === 3 ? 'Get Summary' : 'Enter Stock Symbol';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (stockSymbols.length < 3) {
      const formData = new FormData(e.currentTarget);
      const stockSymbol = formData.get('stock-symbol') as string;

      if (stockSymbols.includes(stockSymbol)) {
        return;
      }

      setStockSymbols([...stockSymbols, stockSymbol]);

      (e.currentTarget as HTMLFormElement).reset();

      return;
    }

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
  return (
    <section className="flex flex-col items-center">
      {!isPending && summary ? (
        <section className="flex flex-col items-center max-w-md space-y-4 mt-4">
          <h3 className="text-xl text-center font-semibold">
            Report generated from the data of the following actions: {stockSymbols.join(', ')}{' '}
          </h3>
          <p className="text-center text-lg border p-4 rounded-lg bg-zinc-100 max-h-96 overflow-y-auto">
            {summary}
          </p>
          <button
            onClick={handleResetSummary}
            className="px-8 py-2  rounded border bg-blue-400 hover:bg-blue-500 transition-colors text-lg font-semibold"
          >
            Make another summary
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <label htmlFor="stock-symbol" className="block mb-2 mt-4 text-lg ">
            Enter a stock symbol up to 3 symbols
          </label>
          <input
            name="stock-symbol"
            id="stock-symbol"
            className="border rounded-lg px-4 py-2"
            type="text"
            placeholder="NVDA"
          />
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
            className="mt-4 font-semibold px-8 py-2 rounded-lg border bg-blue-400 hover:bg-blue-500 transition-colors"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Generating report...' : isNotPendingButtonText}
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
