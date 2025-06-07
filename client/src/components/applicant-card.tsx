import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Briefcase, Calendar, Eye, CheckCircle, XCircle, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApplicationWithDetails } from "@shared/schema";

interface ApplicantCardProps {
  application: ApplicationWithDetails;
}

export default function ApplicantCard({ application }: ApplicantCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { candidate, job } = application;
  const profileData = candidate.profileData as any || {};
  
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest('PUT', `/api/applications/${application.id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/employer'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    },
  });
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600", 
      "from-purple-400 to-purple-600",
      "from-red-400 to-red-600",
      "from-yellow-400 to-yellow-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(candidate.id)}`}>
              <AvatarFallback className="text-white font-bold bg-transparent">
                {getInitials(candidate.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{candidate.username}</h3>
              <p className="text-sm text-gray-600">{candidate.email}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {profileData.location || "Location not specified"}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(application.status)} capitalize`}>
            {application.status}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Briefcase className="h-4 w-4 mr-2" />
            <span className="font-medium">Applied for:</span>
            <span className="ml-1 text-primary">{job.title}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {profileData.skills && profileData.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {profileData.skills.slice(0, 3).map((skill: string) => (
                <Badge key={skill} variant="secondary" className="bg-blue-100 text-primary text-xs">
                  {skill}
                </Badge>
              ))}
              {profileData.skills.length > 3 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  +{profileData.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {application.coverLetter && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {application.coverLetter}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {application.status === 'pending' && (
            <>
              <Button 
                size="sm"
                onClick={() => updateStatusMutation.mutate('reviewing')}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Review
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => updateStatusMutation.mutate('rejected')}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {application.status === 'reviewing' && (
            <>
              <Button 
                size="sm"
                onClick={() => updateStatusMutation.mutate('interview')}
                disabled={updateStatusMutation.isPending}
              >
                <Users className="h-4 w-4 mr-1" />
                Interview
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => updateStatusMutation.mutate('rejected')}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {application.status === 'interview' && (
            <>
              <Button 
                size="sm"
                onClick={() => updateStatusMutation.mutate('offer')}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Offer
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => updateStatusMutation.mutate('rejected')}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}