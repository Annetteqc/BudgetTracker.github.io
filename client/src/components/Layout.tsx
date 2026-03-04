import { Link, useLocation } from "wouter";
import { useBudget, createInitialMonths } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, LogOut, User, ChevronRight, Plus, Moon, Sun, Languages, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentMonthId, months, currentUser, logout, years, currentYear, setCurrentYear, addYear, setCurrentMonthId, language, setLanguage, theme, setTheme, t } = useBudget();
  const [isMonthHovered, setIsMonthHovered] = useState<string | null>(null);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddYear = () => {
    if (!newYearInput || isNaN(parseInt(newYearInput))) return;
    addYear(newYearInput);
    setIsAddingYear(false);
    setNewYearInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-[60]">
        <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-mono text-sm">
            $
          </div>
          SmartBudget
        </h1>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border shrink-0 flex flex-col z-[55] transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-mono">
              $
            </div>
            SmartBudget
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-6">
            {years.map(year => (
              <div key={year} className="space-y-1">
                <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{year} Plan</p>
                <Link href="/">
                  <a 
                    onClick={() => {
                      setCurrentYear(year);
                      setCurrentMonthId(`january-${year}`);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      location === "/" && currentYear === year
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {year} {t("overview")}
                  </a>
                </Link>

                {/* Monthly Budget with Hover Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => setIsMonthHovered(year)}
                  onMouseLeave={() => setIsMonthHovered(null)}
                >
                  <Link href={`/budget/january-${year}`}>
                    <a 
                      onClick={() => {
                        setCurrentYear(year);
                        setCurrentMonthId(`january-${year}`);
                      }}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        location.startsWith("/budget/") && currentYear === year
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5" />
                        <span>{year} {t("monthlyBudget")}</span>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isMonthHovered === year ? "rotate-90" : ""
                      )} />
                    </a>
                  </Link>

                  {/* Submenu */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out bg-muted/50 rounded-lg mt-1 mx-2",
                    isMonthHovered === year ? "max-h-[500px] opacity-100 py-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="flex flex-col">
                      {Object.values(currentUser?.years?.[year] || createInitialMonths(year)).map((month) => (
                        <Link key={month.id} href={`/budget/${month.id}`}>
                          <a 
                            onClick={() => {
                              setCurrentYear(year);
                              setCurrentMonthId(month.id);
                              setIsSidebarOpen(false);
                            }}
                            className={cn(
                              "px-8 py-2 text-[13px] transition-colors hover:text-primary",
                              location === `/budget/${month.id}`
                                ? "text-primary font-bold"
                                : "text-muted-foreground"
                            )}
                          >
                            {t(month.name.split(' ')[0].toLowerCase())}
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border space-y-4">
          {isAddingYear ? (
            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="YYYY"
                  className="w-full bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddYear()}
                  autoFocus
                />
                <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddYear}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                className="w-full text-[10px] uppercase font-bold text-muted-foreground h-6"
                onClick={() => {
                  setIsAddingYear(false);
                  setNewYearInput("");
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full justify-center border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 text-xs font-bold text-muted-foreground hover:text-primary transition-all gap-2 h-10"
              onClick={() => setIsAddingYear(true)}
            >
              <Plus className="w-4 h-4" />
              {t("createNewYear")}
            </Button>
          )}

          <div className="border-t border-border pt-4 bg-slate-50/50 -mx-4 px-8 pb-4">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{currentYear} {t("overview")}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              {t("signOut")}
            </Button>
          </div>

          {/* Preferences Space */}
          <div className="border-t border-border pt-4 pb-2 px-2 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border/50">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7", theme === "light" && "bg-primary/10 text-primary")}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7", theme === "dark" && "bg-primary/10 text-primary")}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border/50">
              <Button
                variant="ghost"
                className={cn("h-7 px-2 text-[10px] font-bold", language === "en" && "bg-primary/10 text-primary")}
                onClick={() => setLanguage("en")}
              >
                EN
              </Button>
              <Button
                variant="ghost"
                className={cn("h-7 px-2 text-[10px] font-bold", language === "fr" && "bg-primary/10 text-primary")}
                onClick={() => setLanguage("fr")}
              >
                FR
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/30">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
