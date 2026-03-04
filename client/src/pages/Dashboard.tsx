import { useBudget } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Wallet, TrendingUp, PiggyBank, ArrowRight, Target, Edit2, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils-format";

export default function Dashboard() {
  const { getYearlyStats, months, currentMonthId, currentUser, updateSavingsGoal, currentYear, t } = useBudget();
  const stats = getYearlyStats();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(String(currentUser?.savingsGoal || 13000));

  const savingsGoal = currentUser?.savingsGoal || 13000;
  const savingsPercentage = Math.min(100, (stats.savingsTotal / savingsGoal) * 100);

  const handleSaveGoal = () => {
    const newGoal = parseFloat(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      updateSavingsGoal(newGoal);
    }
    setIsEditingGoal(false);
  };

  // Format monthly data for chart with 3-letter month names
  const chartData = stats.monthlyData.map((d, i) => {
    const monthId = Object.keys(months)[i];
    return {
      ...d,
      name: t(d.name.toLowerCase()).substring(0, 3),
      savings: months[monthId]?.savings || 0
    };
  });

  // Spending by Category influenced by months
  const aggregatedCategories: Record<string, { value: number, color: string }> = {};
  let totalSavings = 0;

  Object.values(months).forEach(month => {
    totalSavings += month.savings;
    month.categories.forEach(cat => {
      if (cat.spent > 0) {
        if (!aggregatedCategories[cat.name]) {
          aggregatedCategories[cat.name] = { value: 0, color: cat.color };
        }
        aggregatedCategories[cat.name].value += cat.spent;
      }
    });
  });

  if (totalSavings > 0) {
    aggregatedCategories[currentUser?.savingsTabName || "Savings"] = { 
      value: totalSavings, 
      color: "#14b8a6" 
    };
  }

  const totalSpent = Object.values(aggregatedCategories).reduce((sum, cat) => sum + cat.value, 0);

  const displayCategoryData = Object.entries(aggregatedCategories)
    .map(([name, data]) => ({ 
      name, 
      ...data,
      percentage: totalSpent > 0 ? Math.round((data.value / totalSpent) * 100) : 0
    })) as { name: string; value: number; color: string; percentage: number }[];

  // Fallback if no spending yet
  const finalCategoryData = displayCategoryData.length > 0 ? displayCategoryData : [
    { name: "No Spending", value: 1, color: "hsl(var(--muted))", percentage: 0 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">{currentYear} {t("overview")}</h1>
          <p className="text-muted-foreground">{t("history")}.</p>
        </div>
        <Link href={`/budget/${currentMonthId}`}>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t("monthlyBudget")} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("moneyBreakdance")}</CardTitle>
            <CardDescription>{t("monthlyBudget")} {currentYear}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 0, bottom: 0, top: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name={t("income")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="expenses" name={t("expense")} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="savings" name={t("savings")} fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("spendingByCategory")}</CardTitle>
            <CardDescription>{t("history")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {finalCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 overflow-y-auto max-h-[120px] pr-2">
                {finalCategoryData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-medium truncate opacity-80 group-hover:opacity-100 transition-opacity">{entry.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{entry.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-700 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{currentUser?.savingsTabName || "CELI / CELIAPP"} Savings</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setIsEditingGoal(!isEditingGoal)}
              >
                {isEditingGoal ? <Check className="w-4 h-4" onClick={handleSaveGoal} /> : <Edit2 className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-heading font-bold mb-1 flex items-baseline gap-2">
                <span>{formatCurrency(stats.savingsTotal)}</span>
                <span className="text-xl opacity-60">/</span>
                {isEditingGoal ? (
                  <Input 
                    className="w-32 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white h-9"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    onBlur={handleSaveGoal}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                    autoFocus
                  />
                ) : (
                  <span className="text-2xl opacity-80">{formatCurrency(savingsGoal)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm opacity-90 mb-2">
                <span>{t("progress")}</span>
                <span>{savingsPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={savingsPercentage} 
                className="h-2 bg-white/10" 
                indicatorClassName="bg-white"
              />
            </div>
            <p className="text-teal-100 opacity-90">
              ${(savingsGoal - stats.savingsTotal).toLocaleString()} {t("moreToReachGoal")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Wallet className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">{t("yearlyNetBalance")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-heading font-bold mb-2 text-primary">
              {formatCurrency(stats.netBalance)}
            </div>
            <p className="text-muted-foreground">{t("totalIncome")} - ({t("totalExpenses")} + {t("savings")})</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
