import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import ApplicantCard from "@/components/applicant-card";
import { useAuth } from "@/lib/auth";
import type { ApplicationWithDetails } from "@shared/schema";

export default function Candidates() {
  const { data: user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    search: '',
    experience: 'all',
    page: 1,
  });

  // For employers: fetch applicants who applied to their jobs
  const { data: applications, isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ['/api/applications/employer', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/applications/employer/${user?.id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }
      
      return response.json();
    },
    enabled: !!user && user.role === 'employer',
  });

  const filteredApplications = (applications || []).filter(app => {
    if (searchParams.search) {
      const search = searchParams.search.toLowerCase();
      return app.candidate.username.toLowerCase().includes(search) ||
             app.candidate.email.toLowerCase().includes(search) ||
             app.job.title.toLowerCase().includes(search);
    }
    return true;
  });

  if (!user || user.role !== 'employer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">
                Only employers can view job applicants. Please sign in with an employer account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Job Applicants</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review and manage candidates who have applied to your job postings
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Search by candidate name, email, or job title"
                  value={searchParams.search}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                  className="h-12"
                />
              </div>
              <div>
                <Button 
                  onClick={() => setSearchParams({ search: '', experience: 'all', page: 1 })} 
                  variant="outline"
                  className="w-full h-12"
                >
                  Clear Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
              <p className="text-gray-600 mb-4">
                No candidates have applied to your job postings yet.
              </p>
              <Button onClick={() => window.location.href = '/post-job'}>
                Post a Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredApplications.length} applicant{filteredApplications.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApplications.map((application) => (
                <ApplicantCard key={application.id} application={application} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
