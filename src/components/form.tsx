'use client';

import { summarizeStockData } from '@/app/actions';
import { useState, useTransition } from 'react';
import Markdown from 'react-markdown';
import { ComboboxDemo } from './combobox';

export const Form = () => {
  const [currStockSymbol, setCurrStockSymbol] = useState<string>('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isSubmtiButtonDisabled = !currStockSymbol || isPending;

  const updateCurrStockSymbol = (value: string) => {
    setCurrStockSymbol(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      const response = await summarizeStockData({
        ticker: currStockSymbol,
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
    updateCurrStockSymbol('');
  };

  return (
    <section className="flex flex-col items-center">
      {!isPending && summary ? (
        <section className="flex flex-col items-center max-w-md space-y-4 mt-4">
          <Markdown className={'prose max-h-[500px] overflow-y-scroll'}>{summary}</Markdown>
          <button
            onClick={handleResetSummary}
            className="px-8 py-2  rounded-lg border bg-blue-400 hover:bg-blue-500 transition-colors text-lg font-semibold"
          >
            Generate another report
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col items-center mt-6">
          <ComboboxDemo value={currStockSymbol} updateValue={updateCurrStockSymbol} />
          {/* <ol className="space-y-2 mt-2">
            {stockSymbols.map((symbol, index) => (
              <li
                className="px-10 py-2 rounded-lg bg-zinc-200 font-bold flex justify-between"
                key={index}
              >
                {symbol}
              </li>
            ))}
          </ol> */}
          <button
            className="mt-4 font-semibold px-8 py-2 rounded-lg border bg-blue-400 hover:bg-blue-500 transition-colors disabled:bg-zinc-200 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmtiButtonDisabled}
          >
            {isPending ? 'Getting report...🚀' : 'Get report 🚀'}
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
