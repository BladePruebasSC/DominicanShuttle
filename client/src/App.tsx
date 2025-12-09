import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Tours from "@/pages/tours";
import Fleet from "@/pages/fleet";
import Contact from "@/pages/contact";
import AdminDashboard from "@/pages/admin-dashboard";
import SecretAdmin from "@/pages/secret-admin";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import WhatsAppFloat from "@/components/whatsapp-float";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/tours" component={Tours} />
      <Route path="/fleet" component={Fleet} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/cderf" component={SecretAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
          <WhatsAppFloat />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
