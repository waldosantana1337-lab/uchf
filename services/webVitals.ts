// web-vitals.ts
interface Metric {
  name: 'CLS' | 'INP' | 'LCP';
  value: number;
  id: string;
}

type ReportHandler = (metric: Metric) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // @ts-ignore - dynamic URL import not recognized by tsc
    import('https://aistudiocdn.com/web-vitals@^4.2.2/dist/web-vitals.js').then(({ onCLS, onINP, onLCP }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
    });
  }
};

export { reportWebVitals };