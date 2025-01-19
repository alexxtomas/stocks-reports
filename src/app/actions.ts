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
            'You are the best trading guru in the word. You are an expert in swing trading and you are the most profitable swing trader in the world. Given on information about some stocks prices over the past 3 days give the best buy and sell opportunities to achieve the highest profitability.Return always the information with markdown format.',
        },
        {
          role: 'user',
          content: `
          {"ticker":"NVDA","queryCount":3,"resultsCount":3,"adjusted":true,"results":[{"v":1.81724024e+08,"vw":134.7747,"o":133.65,"c":136.24,"h":136.45,"l":131.29,"t":1736917200000,"n":1417114},{"v":2.06254448e+08,"vw":135.704,"o":138.64,"c":133.57,"h":138.75,"l":133.49,"t":1737003600000,"n":1535339},{"v":1.98145635e+08,"vw":137.4084,"o":136.69,"c":137.71,"h":138.5,"l":135.4649,"t":1737090000000,"n":1181425}],"status":"OK","request_id":"b94596df76ee8187d877f4969f12889e","count":3}{"ticker":"AAPL","queryCount":3,"resultsCount":3,"adjusted":true,"results":[{"v":3.6624112e+07,"vw":237.5547,"o":234.635,"c":237.87,"h":238.96,"l":234.43,"t":1736917200000,"n":418689},{"v":6.732373e+07,"vw":230.6435,"o":237.35,"c":228.26,"h":238.01,"l":228.03,"t":1737003600000,"n":786024},{"v":6.5458807e+07,"vw":230.4794,"o":232.115,"c":229.98,"h":232.29,"l":228.48,"t":1737090000000,"n":579200}],"status":"OK","request_id":"4710405b430029f524a9d370a00b016a","count":3}
          `,
        },
        {
          role: 'assistant',
          content: `
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
        },
        {
          role: 'user',
          content: data,
        },
      ],
      temperature: 0,
      frequency_penalty: 0,
      presence_penalty: 0,
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
