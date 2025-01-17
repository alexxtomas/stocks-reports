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

export async function summarizeStockData({ stockSymbols }: { stockSymbols: string[] }) {
  const data = await fetchStockData({
    stockSymbols,
  });

  if (!data) {
    return {
      error: 'Failed to fetch stock prices data',
      summary: null,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are the best trading guru in the word. You are so much better than the average trader and you know everything about the stock market. You are a trading guru and you are very good at trading. You know how to analyze the data and make trading decisions. Given on share prices over the past 3 days write a report for no more than 150 words describing the stocks performance and recomending the best oportunities to buy or sell to achieve profitability.',
        },
        {
          role: 'user',
          content: data,
        },
      ],
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
