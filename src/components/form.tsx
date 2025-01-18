'use client';

import { summarizeStockData } from '@/app/actions';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import Markdown from 'react-markdown';

export const Form = () => {
  const [currStockSymbol, setCurrStockSymbol] = useState<string>('');
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSummary(
      `
## NVDA

**Order**  
Place a limit order at \$132 with a stop at \$130 and a take profit at \$134, using **50%** of your capital.

**Reason**  
There is substantial liquidity around \$132, and the stock is currently trending upwards, making it an opportune moment to buy.

---

## AAPL

**Order**  
Place a sell order at \$235 with a stop at \$240 and a take profit at \$225, using **20%** of your capital.

**Reason**  
We enter a short position at \$235, taking advantage of a resistance level where the price tends to pull back. We set the stop at \$240 to exit if the bearish thesis is invalidated. We aim to take profits at \$225, where we expect support to halt the price drop. We only allocate 20% of our capital to keep risk under control.
      `,
    );
  }, []);

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
            Buy and Sell opportunities for:{' '}
            <span className="font-semibold">{stockSymbols.join(', ')} </span>
          </h3>
          <Markdown className={'prose max-h-[500px] overflow-y-scroll'}>{summary}</Markdown>
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
