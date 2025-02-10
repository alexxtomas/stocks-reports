'use client';

// import { summarizeStockData } from '@/app/actions';
import { useState, useTransition } from 'react';
import Markdown from 'react-markdown';
import { ComboboxDemo } from './combobox';
import { dates } from '@/lib/utils';
import { NEXT_PUBLIC_OPENAI_WORKER_URL, NEXT_PUBLIC_POLYGON_WORKER_URL } from '@/lib/env';

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
      const polygonResponse = await fetch(
        `${NEXT_PUBLIC_POLYGON_WORKER_URL}?startDate=${dates.startDate}&endDate=${dates.endDate}&ticker=${currStockSymbol}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (polygonResponse.status !== 200) {
        setError('Something went wrong please try again later');
        return;
      }
      const polygonData = await polygonResponse.json();

      const response = await fetch(NEXT_PUBLIC_OPENAI_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            role: 'system',
            content:
              'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell. Use the examples provided between ### to set the style your response.',
          },
          {
            role: 'user',
            content: `${polygonData}
              ###
              OK baby, hold on tight! You are going to haate this! Over the past three days, Tesla (TSLA) shares have plummetted. The stock opened at $223.98 and closed at $202.11 on the third day, with some jumping around in the meantime. This is a great time to buy, baby! But not a great time to sell! But I'm not done! Apple (AAPL) stocks have gone stratospheric! This is a seriously hot stock right now. They opened at $166.38 and closed at $182.89 on day three. So all in all, I would hold on to Tesla shares tight if you already have them - they might bounce right back up and head to the stars! They are volatile stock, so expect the unexpected. For APPL stock, how much do you need the money? Sell now and take the profits or hang on and wait for more! If it were me, I would hang on because this stock is on fire right now!!! Apple are throwing a Wall Street party and y'all invited!
              ###
              Apple (AAPL) is the supernova in the stock sky – it shot up from $150.22 to a jaw-dropping $175.36 by the close of day three. We’re talking about a stock that’s hotter than a pepper sprout in a chilli cook-off, and it’s showing no signs of cooling down! If you’re sitting on AAPL stock, you might as well be sitting on the throne of Midas. Hold on to it, ride that rocket, and watch the fireworks, because this baby is just getting warmed up! Then there’s Meta (META), the heartthrob with a penchant for drama. It winked at us with an opening of $142.50, but by the end of the thrill ride, it was at $135.90, leaving us a little lovesick. It’s the wild horse of the stock corral, bucking and kicking, ready for a comeback. META is not for the weak-kneed So, sugar, what’s it going to be? For AAPL, my advice is to stay on that gravy train. As for META, keep your spurs on and be ready for the rally.
              ###
              `,
          },
        ]),
      });

      if (!response.ok) {
        setError('Something went wrong please try again later');
        return;
      }
      const report = await response.json();

      setSummary(report);
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
