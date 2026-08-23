"use client";

import { useEffect, useRef } from "react";

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const container = containerRef.current;
    const containerId = container.id;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        try {
          new window.TradingView.TickerTape({
            symbols: [
              { proName: "OANDA:XAUUSD", title: "Gold" },
              { proName: "OANDA:XAGUSD", title: "Silver" },
              { proName: "OANDA:XBRUSD", title: "Brent Oil" },
              { proName: "OANDA:XNGUSD", title: "Natural Gas" },
              { proName: "OANDA:XCUUSD", title: "Copper" },
              { proName: "OANDA:XPTUSD", title: "Platinum" },
              { proName: "OANDA:XPDUSD", title: "Palladium" },
              { proName: "CME_MINI:ES1!", title: "S&P 500" },
            ],
            showSymbolLogo: true,
            colorTheme: "dark",
            isTransparent: false,
            displayMode: "adaptive",
            width: "100%",
            height: 56,
            container_id: containerId,
          });
        } catch {
          console.warn("TickerTape widget init failed");
        }
      }, 100);
    };

    container.appendChild(script);

    return () => {
      loaded.current = false;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="bg-navy-950 border-b border-white/5">
      <div
        ref={containerRef}
        id="tradingview_ticker_tape"
        className="w-full"
        style={{ height: 56 }}
      />
    </div>
  );
}
