import { useState } from "react";
import { useBudget, Transaction } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, Split, History, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils-format";

const INCOME_CATEGORIES = ["Work Income", "Interact Transfer", "Antoine sent me"];

interface TransactionTabProps {
  initialAmount?: number;
  onClearInitialAmount: () => void;
}

export function TransactionTab({ initialAmount, onClearInitialAmount }: TransactionTabProps) {
  const { currentMonthId, months, addTransaction, deleteTransaction, currentUser, t } = useBudget();
  const currentMonth = months[currentMonthId];

  if (!currentMonth) return null;

  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : "");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"expense" | "income" | "savings">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [isSplit, setIsSplit] = useState(false);
  const [historyTab, setHistoryTab] = useState("all");
  const [transactionDate, setTransactionDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filteredTransactions = historyTab === "all" 
    ? (currentMonth?.transactions || [])
    : (currentMonth?.transactions || []).filter((t: Transaction) => t.type === historyTab);

  // Update local state when initialAmount prop changes
  if (initialAmount && String(initialAmount) !== amount && amount === "") {
    setAmount(String(initialAmount));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    addTransaction(currentMonthId, {
      description,
      amount: parseFloat(amount),
      type,
      categoryId: type === "expense" ? categoryId : undefined,
      isSplitWithAntoine: type === "expense" && isSplit,
      date: new Date(transactionDate).toISOString(),
    });

    // Reset form
    setAmount("");
    setDescription("");
    setIsSplit(false);
    onClearInitialAmount();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t("addTransaction")}</CardTitle>
          <CardDescription>{t("recordTransactions")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className={type === "expense" ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={() => setType("expense")}
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                {t("expense")}
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={type === "income" ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => setType("income")}
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                {t("income")}
              </Button>
              <Button
                type="button"
                variant={type === "savings" ? "default" : "outline"}
                className={type === "savings" ? "bg-teal-500 hover:bg-teal-600 text-white" : ""}
                onClick={() => setType("savings")}
              >
                <PiggyBank className="w-4 h-4 mr-2" />
                {t("savings")}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input 
                  type="number" 
                  className="pl-7 text-lg font-medium" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Input 
                placeholder="What was this for?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {type === "expense" && (
              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentMonth.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input 
                type="date" 
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full text-lg h-12">
              {t("addTransaction")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              {t("history")}
            </CardTitle>
          </div>
          <Tabs value={historyTab} onValueChange={setHistoryTab} className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t("all")}</TabsTrigger>
              <TabsTrigger value="expense" title="Expenses">
                <ArrowDownCircle className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="income" title="Income">
                <ArrowUpCircle className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="savings" title="Savings">
                <PiggyBank className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 pt-0">
          <ScrollArea className="h-[440px] pr-4">
            <div className="space-y-4">
              {filteredTransactions.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No {historyTab !== 'all' ? historyTab : ''} transactions yet.
                </div>
              )}
              {filteredTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${t.type === 'income' ? 'bg-green-100 text-green-600' : 
                        t.type === 'savings' ? 'bg-purple-100 text-purple-600' : 
                        'bg-red-100 text-red-600'}
                    `}>
                      {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : 
                       t.type === 'savings' ? <PiggyBank className="w-5 h-5" /> : 
                       <ArrowDownCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.date), "MMM d, yyyy")} • {t.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-semibold ${
                      t.type === 'income' ? 'text-green-600' : 
                      t.type === 'savings' ? 'text-purple-600' : 
                      'text-foreground'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTransaction(currentMonthId, t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
