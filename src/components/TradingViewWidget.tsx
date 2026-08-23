"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: "light" | "dark";
  height?: number;
  width?: string;
}

export default function TradingViewWidget({
  symbol = "OANDA:XAUUSD",
  interval = "D",
  theme = "dark",
  height = 500,
  width = "100%",
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<boolean>(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (widgetRef.current || !containerRef.current) return;
    widgetRef.current = true;

    const container = containerRef.current;
    const containerId = container.id;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    scriptRef.current = script;

    script.onload = () => {
      if (typeof window.TradingView !== "undefined") {
        setTimeout(() => {
          try {
            new window.TradingView.widget({
              autosize: true,
              symbol,
              interval,
              timezone: "Asia/Jakarta",
              theme,
              style: "1",
              locale: "id",
              toolbar_bg: "#0F2140",
              enable_publishing: false,
              allow_symbol_change: true,
              container_id: containerId,
              hide_side_toolbar: false,
              save_image: false,
              studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
              show_popup_button: false,
            });
          } catch {
            console.warn("TradingView widget init failed");
          }
        }, 100);
      }
    };

    container.appendChild(script);

    return () => {
      widgetRef.current = false;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div
      ref={containerRef}
      id={`tradingview_widget_${symbol.replace(/[^a-zA-Z0-9]/g, "_")}`}
      className="w-full rounded-lg overflow-hidden"
      style={{ height, width }}
    />
  );
}
