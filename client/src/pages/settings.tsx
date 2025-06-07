import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Cog, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["job_seeker", "employer"]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { data: user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRoleWarning, setShowRoleWarning] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "job_seeker",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setShowRoleWarning(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    // Show warning if role is changing
    if (data.role !== user?.role) {
      setShowRoleWarning(true);
      return;
    }
    updateProfileMutation.mutate(data);
  };

  const confirmRoleChange = () => {
    const formData = form.getValues();
    updateProfileMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Sign In</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You need to be signed in to access settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Account Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Profile Information</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 text-gray-600 dark:text-gray-400">
                    <Cog className="h-5 w-5" />
                    <span>Account Preferences</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 text-gray-600 dark:text-gray-400">
                    <Shield className="h-5 w-5" />
                    <span>Privacy & Security</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Type:</span>
                    <Badge variant={user.role === "employer" ? "default" : "secondary"}>
                      {user.role === "employer" ? "Employer" : "Job Seeker"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Since:</span>
                    <span className="text-sm font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your personal information and account preferences.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="username">Full Name</Label>
                      <Input
                        id="username"
                        {...form.register("username")}
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="Enter your email address"
                        className="mt-1"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Select
                      value={form.watch("role")}
                      onValueChange={(value: "job_seeker" | "employer") => {
                        form.setValue("role", value);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_seeker">Job Seeker</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      {form.watch("role") === "employer" 
                        ? "Post jobs and manage applications from candidates"
                        : "Search and apply for job opportunities"
                      }
                    </p>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.role.message}
                      </p>
                    )}
                  </div>

                  {/* Role Change Warning */}
                  {showRoleWarning && (
                    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 dark:text-orange-200">
                        <strong>Important:</strong> Changing your account type will affect your access to features. 
                        {form.watch("role") === "employer" 
                          ? " You'll be able to post jobs and view candidate profiles."
                          : " You'll be able to apply for jobs and manage applications."
                        }
                        <div className="mt-3 flex space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={confirmRoleChange}
                            disabled={updateProfileMutation.isPending}
                          >
                            Confirm Change
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRoleWarning(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setShowRoleWarning(false);
                      }}
                    >
                      Reset Changes
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actions that require extra caution.
                </p>
              </CardHeader>
              <CardContent>
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}