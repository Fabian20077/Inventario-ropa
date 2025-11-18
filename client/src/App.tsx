import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Categorias from "./pages/Categorias";
import Productos from "./pages/Productos";
import Movimientos from "./pages/Movimientos";
import Usuarios from "./pages/Usuarios";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/categorias"} component={Categorias} />
      <Route path={"/productos"} component={Productos} />
      <Route path={"/movimientos"} component={Movimientos} />
      <Route path={"/usuarios"} component={Usuarios} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
