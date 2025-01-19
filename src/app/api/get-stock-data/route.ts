/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_URL = 'https://www.alphavantage.co/query';

type Props = {
  ticker: string;
};

const FUNDAMENTAL_KEYS_TO_KEEP = [
  'MarketCapitalization',
  'EBITDA',
  'PERatio',
  'ForwardPE',
  'PEGRatio',
  'BookValue',
  'DividendPerShare',
  'DividendYield',
  'EPS',
  'DilutedEPSTTM',
  'ProfitMargin',
  'OperatingMarginTTM',
  'ReturnOnAssetsTTM',
  'ReturnOnEquityTTM',
  'QuarterlyEarningsGrowthYOY',
  'QuarterlyRevenueGrowthYOY',
  'PriceToSalesRatioTTM',
  'PriceToBookRatio',
  'EVToRevenue',
  'EVToEBITDA',
  'Beta',
  '52WeekHigh',
  '52WeekLow',
  '50DayMovingAverage',
  '200DayMovingAverage',
  'AnalystTargetPrice',
  'AnalystRatingStrongBuy',
  'AnalystRatingBuy',
  'AnalystRatingHold',
  'AnalystRatingSell',
  'AnalystRatingStrongSell',
  'SharesOutstanding',
];

const NEWS_KEYS_TO_EXCLUDE = {
  ROOT: ['items'],
  FEED: [
    'ticker_sentiment',
    'source_domain',
    'category_within_source',
    'source',
    'banner_image',
    'authors',
    'url',
  ],
};

function parseFundamentalData(data: Record<string, string>) {
  return Object.entries(data).reduce((acc: Record<string, string>, [key, value]) => {
    if (FUNDAMENTAL_KEYS_TO_KEEP.includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

function parseNewsData(data: Record<string, string | Record<string, string>[]>) {
  return Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
    if (!NEWS_KEYS_TO_EXCLUDE.ROOT.includes(key)) {
      acc[key] = value;
      return acc;
    }

    if (key === 'feed' && Array.isArray(value)) {
      acc[key] = value.map((item) => {
        Object.keys(item).forEach((key) => {
          if (NEWS_KEYS_TO_EXCLUDE.FEED.includes(key)) {
            delete item[key];
          }
        });
        return item;
      });
    }

    return acc;
  }, {} as Record<string, any>);
}

async function getFundamentalData({ ticker }: Props) {
  const fundamentalDataResponse = await fetch(
    `${BASE_URL}?function=OVERVIEW&symbol=${ticker}&apikey=cualquiercosa`,
  );

  if (fundamentalDataResponse.status !== 200) {
    console.error('Failed to fundamental data');
    return;
  }

  const data = await fundamentalDataResponse.json();
  return parseFundamentalData(data);
}

async function getNewsData({ ticker }: Props) {
  const newsResponse = await fetch(
    `${BASE_URL}?function=NEWS_SENTIMENT&symbol=${ticker}&apikey=cualquiercosa`,
  );

  if (newsResponse.status !== 200) {
    console.error('Failed to news data');
    return;
  }
  const data = await newsResponse.json();

  return parseNewsData(data);
}

async function getIntradayData({ ticker }: Props) {
  const intradayDataResponse = await fetch(
    `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=cualquiercosa`,
  );

  if (intradayDataResponse.status !== 200) {
    console.error('Failed to fetch data');
    return;
  }

  const data = await intradayDataResponse.json();

  delete data['Meta Data'];

  return data;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ticker = url.searchParams.get('ticker');
  if (!ticker) {
    return new Response('Missing ticker', { status: 400 });
  }
  const result = await Promise.all([
    getFundamentalData({
      ticker,
    }),
    getNewsData({
      ticker,
    }),
    getIntradayData({
      ticker,
    }),
  ]);
  return Response.json(result);
}
