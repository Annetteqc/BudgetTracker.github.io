import { useState } from "react";
import { useBudget } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Delete, Divide, X, Minus, Plus, Equal, ArrowLeft } from "lucide-react";

interface CalculatorProps {
  onSendResult: (amount: number) => void;
}

export function Calculator({ onSendResult }: CalculatorProps) {
  const { t } = useBudget();
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (display === "0" || shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (equation && !shouldResetDisplay) {
      const result = calculate();
      setEquation(result + " " + op + " ");
    } else {
      setEquation(display + " " + op + " ");
    }
    setShouldResetDisplay(true);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      if (!equation) return parseFloat(display);
      
      // eslint-disable-next-line
      const result = eval(fullEquation.replace("x", "*"));
      setDisplay(String(result));
      setEquation("");
      setShouldResetDisplay(true);
      return result;
    } catch (e) {
      setDisplay("Error");
      setShouldResetDisplay(true);
      return 0;
    }
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
    setShouldResetDisplay(false);
  };

  const handleSend = () => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      onSendResult(value);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("calculator")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-xl text-right">
          <div className="text-sm text-muted-foreground h-6">{equation}</div>
          <div className="text-4xl font-mono font-medium tracking-tight overflow-hidden">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={clear} className="text-destructive">AC</Button>
          <Button variant="outline" onClick={backspace}><ArrowLeft className="w-4 h-4" /></Button>
          <Button variant="secondary" className="col-span-2" onClick={() => handleOperator("/")}><Divide className="w-4 h-4" /></Button>

          <Button variant="outline" onClick={() => handleNumber("7")} className="active:scale-95 transition-transform">7</Button>
          <Button variant="outline" onClick={() => handleNumber("8")} className="active:scale-95 transition-transform">8</Button>
          <Button variant="outline" onClick={() => handleNumber("9")} className="active:scale-95 transition-transform">9</Button>
          <Button variant="secondary" onClick={() => handleOperator("*")} className="active:scale-95 transition-transform"><X className="w-4 h-4" /></Button>

          <Button variant="outline" onClick={() => handleNumber("4")} className="active:scale-95 transition-transform">4</Button>
          <Button variant="outline" onClick={() => handleNumber("5")} className="active:scale-95 transition-transform">5</Button>
          <Button variant="outline" onClick={() => handleNumber("6")} className="active:scale-95 transition-transform">6</Button>
          <Button variant="secondary" onClick={() => handleOperator("-")} className="active:scale-95 transition-transform"><Minus className="w-4 h-4" /></Button>

          <Button variant="outline" onClick={() => handleNumber("1")} className="active:scale-95 transition-transform">1</Button>
          <Button variant="outline" onClick={() => handleNumber("2")} className="active:scale-95 transition-transform">2</Button>
          <Button variant="outline" onClick={() => handleNumber("3")} className="active:scale-95 transition-transform">3</Button>
          <Button variant="secondary" onClick={() => handleOperator("+")} className="active:scale-95 transition-transform"><Plus className="w-4 h-4" /></Button>

          <Button variant="outline" onClick={() => handleNumber("0")} className="col-span-2 active:scale-95 transition-transform">0</Button>
          <Button variant="outline" onClick={() => handleNumber(".")} className="active:scale-95 transition-transform">.</Button>
          <Button onClick={calculate} className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform">
            <Equal className="w-4 h-4" />
          </Button>
        </div>

        <Button 
          onClick={handleSend}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg"
        >
          <Send className="w-5 h-5 mr-2" />
          {t("useResult")}
        </Button>
      </CardContent>
    </Card>
  );
}
