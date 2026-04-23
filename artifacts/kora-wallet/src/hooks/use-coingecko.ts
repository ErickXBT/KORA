import { useQuery } from "@tanstack/react-query";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CRYPTO_COMPARE_NEWS_API = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: { price: number[] };
}

export function useTopCoins() {
  return useQuery<CoinMarketData[]>({
    queryKey: ["top-coins"],
    queryFn: async () => {
      const res = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
      );
      if (!res.ok) throw new Error("Failed to fetch top coins");
      return res.json();
    },
    staleTime: 60 * 1000, // 1 min
    refetchInterval: 60 * 1000,
  });
}

export interface CoinDetailChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export function useCoinChart(id: string, days: string = "30") {
  return useQuery<CoinDetailChartData>({
    queryKey: ["coin-chart", id, days],
    queryFn: async () => {
      const res = await fetch(
        `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
      );
      if (!res.ok) throw new Error("Failed to fetch coin chart");
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  imageurl: string;
  source_info: {
    name: string;
    img: string;
    lang: string;
  };
  published_on: number;
  body: string;
  tags: string;
}

export function useCryptoNews() {
  return useQuery<{ Data: NewsArticle[] }>({
    queryKey: ["crypto-news"],
    queryFn: async () => {
      const res = await fetch(CRYPTO_COMPARE_NEWS_API);
      if (!res.ok) throw new Error("Failed to fetch crypto news");
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 min
    refetchInterval: 2 * 60 * 1000,
  });
}
