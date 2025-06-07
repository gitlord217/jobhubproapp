import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Users, TrendingUp, HandHeart, ArrowUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface AnalyticsData {
  totalJobs: number;
  activeCandidates: number;
  totalApplications: number;
  successfulHires: number;
  jobsByIndustry: { industry: string; count: number }[];
  skillDemand: { skill: string; count: number }[];
  avgSalaryByRole: { role: string; avgSalary: number }[];
  applicationTrends: { date: string; count: number }[];
}

export default function Analytics() {
  const { data: user } = useAuth();

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return response.json();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
              <p className="text-gray-600">
                You need to be signed in to view analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Jobs Posted",
      value: analytics.totalJobs.toLocaleString(),
      change: "+12%",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Candidates",
      value: analytics.activeCandidates.toLocaleString(),
      change: "+8%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Applications",
      value: analytics.totalApplications.toLocaleString(),
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Successful Hires",
      value: analytics.successfulHires.toLocaleString(),
      change: "+22%",
      icon: HandHeart,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time insights and analytics</p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`${stat.bgColor} rounded-lg p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Jobs Posted by Industry */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs Posted by Industry</CardTitle>
              <p className="text-sm text-gray-600">Based on current job postings in our platform</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.jobsByIndustry.map((industry, index) => {
                  const maxCount = Math.max(...analytics.jobsByIndustry.map(i => i.count));
                  const percentage = (industry.count / maxCount) * 100;
                  
                  return (
                    <div key={industry.industry}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{industry.industry}</span>
                        <span className="text-sm text-gray-500">{industry.count.toLocaleString()} jobs</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Most In-Demand Skills (Real World Data) */}
          <Card>
            <CardHeader>
              <CardTitle>Most In-Demand Skills</CardTitle>
              <p className="text-sm text-gray-600">Real-world industry demand trends</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.skillDemand.map((skill, index) => {
                  const maxCount = Math.max(...analytics.skillDemand.map(s => s.count));
                  const percentage = (skill.count / maxCount) * 100;
                  
                  return (
                    <div key={skill.skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                        <span className="text-sm text-gray-500">{skill.count.toLocaleString()} mentions</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Average Salary by Role */}
          <Card>
            <CardHeader>
              <CardTitle>Average Salary by Job Role</CardTitle>
              <p className="text-sm text-gray-600">Based on job postings with salary data</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.avgSalaryByRole.map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{role.role}</span>
                    <span className="text-lg font-bold text-primary">
                      ${Math.round(role.avgSalary / 1000)}k
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Application Trends Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Application Activity</CardTitle>
              <p className="text-sm text-gray-600">Recent application trends on our platform</p>
            </CardHeader>
            <CardContent>
              {analytics.applicationTrends.length > 0 ? (
                <div className="space-y-3">
                  {analytics.applicationTrends.slice(-7).map((trend) => (
                    <div key={trend.date} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-primary">{trend.count} applications</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No application data available yet</p>
                  <p className="text-sm">Data will appear as users apply to jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interactive Application Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Application Trends Over Time</CardTitle>
            <p className="text-sm text-gray-600">
              Daily application activity trends and patterns
            </p>
          </CardHeader>
          <CardContent>
            {analytics.applicationTrends.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.applicationTrends.map(trend => ({
                      ...trend,
                      formattedDate: new Date(trend.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="formattedDate" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f9fafb'
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const originalDate = payload[0].payload.date;
                          return new Date(originalDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric' 
                          });
                        }
                        return label;
                      }}
                      formatter={(value: number) => [
                        `${value} application${value !== 1 ? 's' : ''}`, 
                        'Applications'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorApplications)"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Application Data</p>
                  <p className="text-sm">Chart will populate as users apply to jobs</p>
                </div>
              </div>
            )}
            
            {/* Summary Statistics */}
            {analytics.applicationTrends.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.applicationTrends.reduce((sum, trend) => sum + trend.count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(analytics.applicationTrends.reduce((sum, trend) => sum + trend.count, 0) / analytics.applicationTrends.length)}
                  </div>
                  <div className="text-sm text-gray-600">Daily Average</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...analytics.applicationTrends.map(t => t.count))}
                  </div>
                  <div className="text-sm text-gray-600">Peak Day</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics.applicationTrends.length}
                  </div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
