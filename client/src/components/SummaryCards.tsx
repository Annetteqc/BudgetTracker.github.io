import { useBudget } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Wallet, TrendingDown, PiggyBank, Users, Scale, Edit2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils-format";
import { useState } from "react";

export function SummaryCards() {
  const { currentMonthId, months, transferAntoineOwes, currentUser, updateCustomNames, t } = useBudget();
  const currentMonth = months[currentMonthId] || Object.values(months)[0];
  
  const [isEditingSavingsName, setIsEditingSavingsName] = useState(false);
  const [tempSavingsName, setTempSavingsName] = useState(currentUser?.savingsTabName || "CELI / CELIAPP");
  
  const [isEditingAntoineName, setIsEditingAntoineName] = useState(false);
  const [tempAntoineName, setTempAntoineName] = useState(currentUser?.antoineName || "Antoine");
  
  const [isEditingAntoineOwesName, setIsEditingAntoineOwesName] = useState(false);
  const [tempAntoineOwesName, setTempAntoineOwesName] = useState(currentUser?.antoineOwesName || "Antoine Owes Me");

  const [isEditingMonthlyObjective, setIsEditingMonthlyObjective] = useState(false);
  const [tempMonthlyObjective, setTempMonthlyObjective] = useState(String(currentUser?.monthlySavingsObjective || 1000));

  if (!currentMonth) return null;

  const monthlyBalance = currentMonth.totalIncome - currentMonth.totalExpenses - currentMonth.savings;

  const handleSaveSavingsName = () => {
    updateCustomNames({ savingsTabName: tempSavingsName });
    setIsEditingSavingsName(false);
  };

  const handleSaveAntoineName = () => {
    updateCustomNames({ antoineName: tempAntoineName });
    setIsEditingAntoineName(false);
  };

  const handleSaveAntoineOwesName = () => {
    updateCustomNames({ antoineOwesName: tempAntoineOwesName });
    setIsEditingAntoineOwesName(false);
  };

  const handleSaveMonthlyObjective = () => {
    updateCustomNames({ monthlySavingsObjective: parseFloat(tempMonthlyObjective) || 0 });
    setIsEditingMonthlyObjective(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">{t("totalIncome")}</p>
              <h3 className="text-2xl font-bold font-heading">{formatCurrency(currentMonth.totalIncome)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("totalExpenses")}</p>
              <h3 className="text-2xl font-bold font-heading text-red-600">
                {formatCurrency(currentMonth.totalExpenses)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90 flex flex-col">
                {isEditingSavingsName ? (
                  <input 
                    className="bg-transparent border-b border-white/50 outline-none w-full text-white"
                    value={tempSavingsName}
                    onChange={(e) => setTempSavingsName(e.target.value)}
                    onBlur={handleSaveSavingsName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSavingsName()}
                    autoFocus
                  />
                ) : (
                  <span onClick={() => setIsEditingSavingsName(true)} className="cursor-pointer hover:underline">
                    {currentUser?.savingsTabName || "CELI / CELIAPP"}
                  </span>
                )}
                {isEditingMonthlyObjective ? (
                  <span className="flex items-center gap-1 text-[10px] mt-1">
                    Obj: $
                    <input 
                      className="bg-transparent border-b border-white/50 outline-none w-12 text-white"
                      value={tempMonthlyObjective}
                      onChange={(e) => setTempMonthlyObjective(e.target.value)}
                      onBlur={handleSaveMonthlyObjective}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveMonthlyObjective()}
                      autoFocus
                    />
                  </span>
                ) : (
                  <span onClick={() => setIsEditingMonthlyObjective(true)} className="text-[10px] opacity-70 cursor-pointer hover:underline">
                    Obj: ${currentUser?.monthlySavingsObjective || 1000}
                  </span>
                )}
              </p>

              <h3 className="text-2xl font-bold font-heading">{formatCurrency(currentMonth.savings)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-100 border-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-200 text-slate-700 rounded-full">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{t("monthlyBalance")}</p>
              <h3 className={`text-2xl font-bold font-heading ${monthlyBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(monthlyBalance)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
