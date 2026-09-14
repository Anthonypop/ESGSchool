import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Environment from "./pages/Environment";
import Social from "./pages/Social";
import Governance from "./pages/Governance";
import { SchoolProfileProvider } from "./contexts/SchoolProfileContext";
import Portal from "./pages/Portal";
import AdminReview from "./pages/AdminReview";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/environment"} component={Environment} />
      <Route path={"/social"} component={Social} />
      <Route path={"/governance"} component={Governance} />
      <Route path={"/portal"} component={Portal} />
      <Route path={"/admin"} component={AdminReview} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <SchoolProfileProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SchoolProfileProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
