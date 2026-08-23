// Global TradingView type declaration
declare global {
  interface Window {
    TradingView: Record<string, new (config: Record<string, unknown>) => void> & {
      widget: new (config: Record<string, unknown>) => void;
      TickerTape: new (config: Record<string, unknown>) => void;
    };
  }
}

export {};
