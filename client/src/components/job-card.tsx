import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Clock, DollarSign, Users, Eye, Heart, X } from "lucide-react";
import type { JobWithEmployer } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JobCardProps {
  job: JobWithEmployer;
}

export default function JobCard({ job }: JobCardProps) {
  const { data: user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if user has already applied to this job
  const { data: userApplications = [] } = useQuery({
    queryKey: ['/api/applications/candidate', user?.id],
    enabled: !!user && user.role === 'job_seeker',
  });

  const hasApplied = Array.isArray(userApplications) && userApplications.some((app: any) => app.jobId === job.id);

  const applyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/applications', {
        jobId: job.id,
        coverLetter: '',
      });
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
      // Invalidate both possible query keys to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/applications/candidate', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/candidate'] });
      // Force a refetch of this specific query
      queryClient.refetchQueries({ queryKey: ['/api/applications/candidate', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const cancelApplicationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/applications/${job.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Application cancelled",
        description: "Your application has been withdrawn.",
      });
      // Invalidate both possible query keys to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/applications/candidate', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/candidate'] });
      // Force a refetch of this specific query
      queryClient.refetchQueries({ queryKey: ['/api/applications/candidate', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel application",
        variant: "destructive",
      });
    },
  });

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  };

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'job_seeker') {
      toast({
        title: "Access denied",
        description: "Only job seekers can apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate();
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Job removed from your bookmarks" : "Job saved to your bookmarks",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary cursor-pointer">
                {job.title}
              </h3>
              <p className="text-gray-600">{job.company}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.jobType}
                </span>
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary(job.salaryMin || undefined, job.salaryMax || undefined)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className={isBookmarked ? "text-red-500" : "text-gray-400 hover:text-red-500"}
            >
              <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <span className="text-sm text-gray-500">
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {job.description}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-blue-100 text-primary">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              0 applicants
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              0 views
            </span>
          </div>
          
          {user?.role === 'job_seeker' && (
            <div className="flex items-center space-x-2">
              {hasApplied ? (
                <>
                  <Button 
                    variant="outline"
                    className="text-primary border-primary"
                    disabled
                  >
                    Applied
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelApplicationMutation.mutate()}
                    disabled={cancelApplicationMutation.isPending}
                  >
                    {cancelApplicationMutation.isPending ? (
                      "Cancelling..."
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? "Applying..." : "Apply Now"}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
