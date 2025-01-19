'use server';
import { dates } from '@/lib/utils';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function fetchStockData({ stockSymbols }: { stockSymbols: string[] }) {
  try {
    const stockData = await Promise.all(
      stockSymbols.map(async (ticker) => {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_API_KEY}`;
        const response = await fetch(url);

        if (response.status !== 200) {
          console.error('Failed to fetch data for ticker', ticker);
        }
        const data = await response.text();

        return data;
      }),
    );

    return stockData.join('');
  } catch (err) {
    console.log(err);
  }
}

export async function summarizeStockData({ ticker }: { ticker: string }) {
  const dataResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/get-stock-data?ticker=${ticker}`,
  );

  if (dataResponse.status !== 200) {
    return {
      error: 'Failed to fetch stock prices data',
      summary: null,
    };
  }

  const data = await dataResponse.text();

  console.log({ data });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are the best trader, swing trader, and investor of all history.
             Given some data on a particular stock, your goal is to provide the best report as possible, it be in an informal tone, as if you were telling a friend. 
             Always trying to give the best possible advice explaining why and what the data I have given you means and what actions should be taken.
             Always return markdown.
            `,
        },
        {
          role: 'user',
          content: `
           You're an expert in the ${ticker} stock, here's the data
           ${data}
          `,
        },
      ],
      temperature: 0.5,
    });

    const messageContent = response.choices[0].message.content;

    return {
      error: null,
      summary: messageContent,
    };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to generate summary',
      summary: null,
    };
  }
}
