export function formatCurrency(amount: number) {
  const isWhole = amount % 1 === 0;
  const parts = amount.toFixed(2).split(".");
  const integerPart = parseInt(parts[0]);
  const decimalPart = parts[1];
  
  return (
    <span className="inline-flex items-baseline">
      {integerPart !== 0 && <span>${integerPart.toLocaleString()}</span>}
      {integerPart === 0 && <span>$0</span>}
      {!isWhole && <span className="text-[0.7em] opacity-80 font-medium">.{decimalPart}</span>}
    </span>
  );
}

export function formatCompactCurrency(amount: number) {
  const isWhole = amount % 1 === 0;
  const parts = amount.toFixed(2).split(".");
  const integerPart = parseInt(parts[0]);
  const decimalPart = parts[1];
  
  return (
    <span className="inline-flex items-baseline">
      {integerPart !== 0 && <span>${integerPart.toLocaleString()}</span>}
      {integerPart === 0 && <span>$0</span>}
      {!isWhole && <span className="text-[0.6em] opacity-70">.{decimalPart}</span>}
    </span>
  );
}
