import { useBudget, Category } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Settings2, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils-format";

export function CategoryBudgetTab() {
  const { currentMonthId, months, addCategory, updateCategory, deleteCategory, t } = useBudget();
  const currentMonth = months[currentMonthId];
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [acrossAllMonths, setAcrossAllMonths] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && newCategoryBudget) {
      addCategory(currentMonthId, newCategoryName, parseFloat(newCategoryBudget), acrossAllMonths);
      setNewCategoryName("");
      setNewCategoryBudget("");
      setAcrossAllMonths(false);
      setIsDialogOpen(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditValue(String(category.budget));
  };

  const saveEdit = (category: Category) => {
    const newBudget = parseFloat(editValue);
    if (!isNaN(newBudget)) {
      updateCategory(currentMonthId, { ...category, budget: newBudget });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">{t("categoryBudgets")}</h2>
          <p className="text-muted-foreground">{t("recordTransactions")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("newCategory")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newCategory")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t("categoryName")}</Label>
                <Input 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  placeholder="e.g. Travel"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("monthlyBudgetLabel")}</Label>
                <Input 
                  type="number"
                  value={newCategoryBudget} 
                  onChange={e => setNewCategoryBudget(e.target.value)} 
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="acrossAllMonths" 
                  checked={acrossAllMonths}
                  onChange={(e) => setAcrossAllMonths(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="acrossAllMonths" className="text-sm font-medium cursor-pointer">
                  {t("addToAllMonths")} {currentMonthId.split('-')[1]}
                </Label>
              </div>
              <Button type="submit" className="w-full">{t("createCategory")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {currentMonth.categories.map((category) => {
            const percentage = Math.min(100, (category.spent / category.budget) * 100);
            const isOverBudget = category.spent > category.budget;

            return (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card className="overflow-hidden group/card relative border-none shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="absolute top-0 left-0 w-1 h-full" 
                    style={{ backgroundColor: category.color }} 
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCategory(currentMonthId, category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-start pr-8">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">{category.name}</CardTitle>
                      {isOverBudget && (
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                          Over
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {editingId === category.id ? (
                        <div className="flex items-center gap-1">
                          <Input 
                            className="h-7 w-20 text-xs" 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)}
                            autoFocus
                          />
                          <Button size="icon" className="h-7 w-7" onClick={() => saveEdit(category)}>
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-2 cursor-pointer" onClick={() => startEditing(category)}>
                          <div className="text-lg font-black font-heading tracking-tight">
                            {formatCurrency(category.spent)} <span className="text-xs font-normal text-muted-foreground opacity-60">/ {formatCurrency(category.budget)}</span>
                          </div>
                          <Settings2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="space-y-1.5">
                      <Progress 
                        value={percentage} 
                        className="h-1.5 bg-muted/30" 
                        indicatorClassName={isOverBudget ? "bg-red-500" : undefined}
                        indicatorStyle={!isOverBudget ? { backgroundColor: category.color } : undefined}
                      />
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                        <span>{percentage.toFixed(0)}% {t("utilized")}</span>
                        <span>{formatCurrency(category.budget - category.spent)} {t("remainder")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
