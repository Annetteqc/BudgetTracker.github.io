import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useBudget } from "@/lib/store";
import { SummaryCards } from "@/components/SummaryCards";
import { Calculator } from "@/components/Calculator";
import { TransactionTab } from "@/components/TransactionTab";
import { CategoryBudgetTab } from "@/components/CategoryBudgetTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

export default function MonthView() {
  const [match, params] = useRoute("/budget/:monthId");
  const { months, currentMonthId, setCurrentMonthId, t } = useBudget();
  const [, setLocation] = useLocation();
  
  const [calculatorResult, setCalculatorResult] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (params?.monthId && months[params.monthId]) {
      setCurrentMonthId(params.monthId);
    }
  }, [params?.monthId, months, setCurrentMonthId]);

  const currentMonth = params?.monthId ? months[params.monthId] : null;

  if (!params?.monthId || !currentMonth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-xl font-semibold">{t("monthNotAvailable")}</h2>
        <p className="text-muted-foreground">{t("monthNotExist")}</p>
        <button 
          onClick={() => setLocation("/")}
          className="text-primary hover:underline font-medium"
        >
          {t("returnToDashboard")}
        </button>
      </div>
    );
  }

  const handleMonthChange = (value: string) => {
    setLocation(`/budget/${value}`);
  };

  const handleCalculatorResult = (amount: number) => {
    setCalculatorResult(amount);
    // Smooth scroll to transaction form
    const el = document.getElementById("transaction-form");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">{t(currentMonth.name.split(' ')[0].toLowerCase())} {currentMonth.name.split(' ')[1]} Budget</h1>
          <p className="text-muted-foreground text-sm">{t("recordTransactions")}.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground hidden md:inline">Switch Month:</span>
          <Select value={currentMonthId} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200 shadow-sm">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(months).map((month) => (
                <SelectItem key={month.id} value={month.id} className="cursor-pointer">
                  {t(month.name.split(' ')[0].toLowerCase())} {month.name.split(' ')[1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SummaryCards />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Calculator Column */}
        <div className="xl:col-span-3">
          <Calculator onSendResult={handleCalculatorResult} />
        </div>
        
        {/* Transactions Column */}
        <div id="transaction-form" className="xl:col-span-9 h-full">
          <TransactionTab 
            initialAmount={calculatorResult} 
            onClearInitialAmount={() => setCalculatorResult(undefined)}
          />
        </div>
      </div>

      {/* Categories at bottom */}
      <div className="pt-6 border-t">
        <CategoryBudgetTab />
      </div>
    </div>
  );
}
