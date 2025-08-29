import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import AlternativeLayout from "@/pages/alternative-layout";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="fixed top-4 left-4 z-50 flex gap-2">
      <Link 
        href="/"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          location === "/" 
            ? "bg-orange-500 text-white" 
            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
      >
        Main Interface
      </Link>
      <Link 
        href="/alternative"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          location === "/alternative" 
            ? "bg-orange-500 text-white" 
            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
      >
        Alternative Layout
      </Link>
    </nav>
  );
}

function Router() {
  return (
    <div className="relative">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/alternative" component={AlternativeLayout} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mars-rover-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
