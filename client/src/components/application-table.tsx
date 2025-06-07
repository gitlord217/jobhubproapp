import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { ApplicationWithDetails } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ApplicationTableProps {
  applications: ApplicationWithDetails[];
  showJobColumn?: boolean;
  showActions?: boolean;
}

export default function ApplicationTable({ applications, showJobColumn = true, showActions = true }: ApplicationTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      await apiRequest('PUT', `/api/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const calculateMatchScore = () => {
    return Math.floor(Math.random() * 30) + 70; // Random score between 70-100
  };

  const handleStatusUpdate = (applicationId: number, status: string) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Candidate</TableHead>
              {showJobColumn && <TableHead>Job</TableHead>}
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Match Score</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => {
              const matchScore = calculateMatchScore();
              return (
                <TableRow key={application.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className={`w-10 h-10 bg-gradient-to-br ${getGradientClass(application.candidate.id)}`}>
                        <AvatarFallback className="text-white font-bold text-sm bg-transparent">
                          {getInitials(application.candidate.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.candidate.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.candidate.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {showJobColumn && (
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.job.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.job.company}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-gray-500">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={matchScore} className="w-16 h-2" />
                      <span className="text-sm font-medium text-gray-700">{matchScore}%</span>
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="link" size="sm" className="text-primary hover:text-blue-700 p-0">
                          View
                        </Button>
                        {application.status === "pending" && (
                          <>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700 p-0"
                              onClick={() => handleStatusUpdate(application.id, "interview")}
                              disabled={updateStatusMutation.isPending}
                            >
                              Interview
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 p-0"
                              onClick={() => handleStatusUpdate(application.id, "rejected")}
                              disabled={updateStatusMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === "interview" && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-yellow-600 hover:text-yellow-700 p-0"
                            onClick={() => handleStatusUpdate(application.id, "offer")}
                            disabled={updateStatusMutation.isPending}
                          >
                            Offer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
