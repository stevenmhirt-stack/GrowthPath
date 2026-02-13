import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { User, CreditCard, Calendar, Shield, LogOut, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Account() {
  const { user } = useAuth();
  const { isPremium, subscriptionStatus, currentPeriodEnd, hasStripeCustomer, isLoading: subscriptionLoading } = useSubscription();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open billing portal");
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
      setIsManagingSubscription(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      queryClient.clear();
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">My Account</h1>
          <p className="text-muted-foreground">Manage your account settings and subscription</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Manage your GrowthPath subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isPremium ? "default" : "outline"}>
                      {isPremium ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant={subscriptionStatus === "active" ? "default" : 
                             subscriptionStatus === "trialing" ? "secondary" : "outline"}
                  >
                    {subscriptionStatus === "active" ? "Active" :
                     subscriptionStatus === "trialing" ? "Trial" :
                     subscriptionStatus === "canceled" ? "Canceled" : "Inactive"}
                  </Badge>
                </div>
                
                {currentPeriodEnd && isPremium && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {subscriptionStatus === "canceled" ? "Access Until" : "Next Billing Date"}
                      </span>
                      <span className="font-medium">
                        {format(new Date(currentPeriodEnd), "MMMM d, yyyy")}
                      </span>
                    </div>
                  </>
                )}

                <Separator />

                <div className="pt-2">
                  {hasStripeCustomer ? (
                    <Button 
                      onClick={handleManageSubscription}
                      disabled={isManagingSubscription}
                      className="w-full"
                      variant="outline"
                      data-testid="button-manage-subscription"
                    >
                      {isManagingSubscription ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        Upgrade to Premium to unlock all features
                      </p>
                      <Button 
                        onClick={() => window.location.href = "/"}
                        className="w-full"
                        data-testid="button-upgrade"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </div>

                {isPremium && (
                  <p className="text-xs text-muted-foreground text-center">
                    You can cancel, update payment methods, or change your plan in the billing portal.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
