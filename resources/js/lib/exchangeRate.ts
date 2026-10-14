export interface ExchangeRateData {
  rate: number;
  updatedAt: string;
  timeString: string;
  source: string;
  isLive: boolean;
}

const CACHE_KEY = "kfi_usd_idr_exchange_rate_v1";
export const DEFAULT_USD_IDR_RATE = 16250;
export const RATE_UPDATE_EVENT = "kfi_exchange_rate_updated";

function formatTimeString(date: Date): string {
  try {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIB";
  } catch {
    return "Terkini";
  }
}

/**
 * Mengambil kurs tersimpan dari cache lokal dengan fallback default
 */
export function getStoredUSDIDRRate(): ExchangeRateData {
  if (typeof window === "undefined") {
    return {
      rate: DEFAULT_USD_IDR_RATE,
      updatedAt: new Date().toISOString(),
      timeString: "Terkini",
      source: "Default",
      isLive: false,
    };
  }

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.rate === "number" && parsed.rate > 1000) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse error
  }

  return {
    rate: DEFAULT_USD_IDR_RATE,
    updatedAt: new Date().toISOString(),
    timeString: formatTimeString(new Date()),
    source: "Default",
    isLive: false,
  };
}

/**
 * Mengambil data kurs USD/IDR terkini secara langsung dari API live publik
 * dengan fallback bertingkat dan caching otomatis
 */
export async function fetchLiveUSDIDRRate(): Promise<ExchangeRateData> {
  const now = new Date();
  const timeString = formatTimeString(now);

  // 1. Coba endpoint utama ExchangeRate API
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const idrRate = Number(data?.rates?.IDR);

      if (idrRate && idrRate > 1000) {
        const result: ExchangeRateData = {
          rate: Math.round(idrRate),
          updatedAt: now.toISOString(),
          timeString,
          source: "ExchangeRate API",
          isLive: true,
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(result));
            window.dispatchEvent(new CustomEvent(RATE_UPDATE_EVENT, { detail: result }));
          } catch {
            // Ignore storage quota error
          }
        }

        return result;
      }
    }
  } catch {
    // Lanjut ke fallback endpoint kedua
  }

  // 2. Coba endpoint fallback kedua Open ER API
  try {
    const response2 = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });

    if (response2.ok) {
      const data2 = await response2.json();
      const idrRate2 = Number(data2?.rates?.IDR);

      if (idrRate2 && idrRate2 > 1000) {
        const result: ExchangeRateData = {
          rate: Math.round(idrRate2),
          updatedAt: now.toISOString(),
          timeString,
          source: "Open ER-API",
          isLive: true,
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(result));
            window.dispatchEvent(new CustomEvent(RATE_UPDATE_EVENT, { detail: result }));
          } catch {
            // Ignore storage error
          }
        }

        return result;
      }
    }
  } catch {
    // API gagal atau offline
  }

  // 3. Ambil dari cache tersimpan jika ada
  const cached = getStoredUSDIDRRate();
  return {
    ...cached,
    timeString: cached.timeString || timeString,
  };
}
