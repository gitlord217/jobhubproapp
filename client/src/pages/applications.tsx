import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationTable from "@/components/application-table";
import { useAuth } from "@/lib/auth";
import type { ApplicationWithDetails } from "@shared/schema";

export default function Applications() {
  const { data: user } = useAuth();
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // For job seekers - get their applications
  const { data: candidateApplications, isLoading: candidateLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ['/api/applications/candidate', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/applications/candidate/${user?.id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      return response.json();
    },
    enabled: !!user && user.role === 'job_seeker',
  });

  // For employers - get applications for their jobs
  const { data: employerJobs } = useQuery({
    queryKey: ['/api/jobs', { employer: true }],
    queryFn: async () => {
      const response = await fetch('/api/jobs?employer=true', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    },
    enabled: !!user && user.role === 'employer',
  });

  // Get all applications for employer's jobs
  const { data: allApplications, isLoading: employerLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ['/api/applications', 'employer', user?.id, filters],
    queryFn: async () => {
      if (!employerJobs?.jobs?.length) return [];
      
      // Fetch applications for each job
      const applicationPromises = employerJobs.jobs.map(async (job: any) => {
        const response = await fetch(`/api/applications/job/${job.id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch applications for job ${job.id}`);
        }
        
        return response.json();
      });

      const applicationArrays = await Promise.all(applicationPromises);
      return applicationArrays.flat();
    },
    enabled: !!user && user.role === 'employer' && !!employerJobs?.jobs?.length,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
              <p className="text-gray-600">
                You need to be signed in to view applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role === 'job_seeker') {
    const applications = candidateApplications || [];
    const isLoading = candidateLoading;

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">My Applications</h2>
            <p className="text-gray-600">Track the status of your job applications</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't applied to any jobs yet. Start browsing opportunities!
                </p>
                <Button onClick={() => window.location.href = '/jobs'}>
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ApplicationTable applications={applications} showJobColumn={true} showActions={false} />
          )}
        </div>
      </div>
    );
  }

  // Employer view
  const applications = allApplications || [];
  const isLoading = employerLoading;
  
  // Filter applications based on selected filters
  const filteredApplications = applications.filter(app => {
    if (filters.status && filters.status !== 'all' && app.status !== filters.status) return false;
    if (filters.dateFrom && new Date(app.appliedAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(app.appliedAt) > new Date(filters.dateTo)) return false;
    return true;
  });

  // Group applications by status for tabs
  const applicationsByStatus = {
    all: filteredApplications,
    pending: filteredApplications.filter(app => app.status === 'pending'),
    reviewing: filteredApplications.filter(app => app.status === 'reviewing'),
    interview: filteredApplications.filter(app => app.status === 'interview'),
    offer: filteredApplications.filter(app => app.status === 'offer'),
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Management</h2>
          <p className="text-gray-600">Track and manage job applications efficiently</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
              <div>
                <Button
                  onClick={() => setFilters({ status: 'all', dateFrom: '', dateTo: '' })}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({applicationsByStatus.all.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({applicationsByStatus.pending.length})
              </TabsTrigger>
              <TabsTrigger value="reviewing">
                Reviewing ({applicationsByStatus.reviewing.length})
              </TabsTrigger>
              <TabsTrigger value="interview">
                Interview ({applicationsByStatus.interview.length})
              </TabsTrigger>
              <TabsTrigger value="offer">
                Offer ({applicationsByStatus.offer.length})
              </TabsTrigger>
            </TabsList>

            {Object.entries(applicationsByStatus).map(([status, apps]) => (
              <TabsContent key={status} value={status}>
                {apps.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <h3 className="text-lg font-semibold mb-2">No Applications</h3>
                      <p className="text-gray-600">
                        No applications found for the selected criteria.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <ApplicationTable applications={apps} showJobColumn={true} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
