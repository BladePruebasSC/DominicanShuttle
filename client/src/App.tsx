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
import TrackingPage from "@/pages/tracking";
import FeedbackPage from "@/pages/feedback";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useSecretCode } from "@/hooks/use-secret-code";
import ScrollToTop from "@/components/scroll-to-top";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/tours" component={Tours} />
      <Route path="/fleet" component={Fleet} />
      <Route path="/contact" component={Contact} />
      <Route path="/tracking" component={TrackingPage} />
      <Route path="/reserva/:id" component={TrackingPage} />
      <Route path="/feedback/:id" component={FeedbackPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/cderf" component={SecretAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Activar detección de código secreto
  useSecretCode();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <ScrollToTop />
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
