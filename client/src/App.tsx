import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BudgetProvider } from "@/lib/store";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import MonthView from "@/pages/MonthView";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { useBudget } from "@/lib/store";

function Router() {
  const { currentUser } = useBudget();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/budget/:monthId" component={MonthView} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BudgetProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </BudgetProvider>
    </QueryClientProvider>
  );
}

export default App;
