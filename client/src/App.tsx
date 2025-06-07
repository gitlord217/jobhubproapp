import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Jobs from "@/pages/jobs";
import PostJob from "@/pages/post-job";
import Candidates from "@/pages/candidates";
import Analytics from "@/pages/analytics";
import Applications from "@/pages/applications";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/post-job" component={PostJob} />
        <Route path="/candidates" component={Candidates} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/applications" component={Applications} />
        <Route path="/settings" component={Settings} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
