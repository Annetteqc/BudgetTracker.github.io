import { useState } from "react";
import { useBudget } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, UserPlus, LogIn, PiggyBank } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const { login, register } = useBudget();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    if (isRegister) {
      const success = register(username, password);
      if (success) {
        toast({ title: "Account created", description: "Welcome to SmartBudget!" });
      } else {
        toast({ title: "Error", description: "Username already exists", variant: "destructive" });
      }
    } else {
      const success = login(username, password);
      if (success) {
        toast({ title: "Welcome back", description: `Logged in as ${username}` });
      } else {
        toast({ title: "Error", description: "Invalid username or password", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
              <PiggyBank className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">SmartBudget <span className="text-primary">2026</span></h1>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card text-card-foreground">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">{isRegister ? "Create an account" : "Welcome back"}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {isRegister ? "Enter your details to start tracking" : "Login to access your financial dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input 
                    id="username"
                    name="username"
                    type="text"
                    inputMode="text"
                    autoComplete="username"
                    placeholder="john_doe" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 bg-background border-border"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <UserPlus className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-background border-border"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-medium transition-all hover:translate-y-[-1px] active:translate-y-[1px]">
                {isRegister ? "Register" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {isRegister ? "Already have an account? Sign In" : "Don't have an account? Create one"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
