import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, List, Grid } from "lucide-react";
import JobCard from "@/components/job-card";
import type { JobWithEmployer } from "@shared/schema";
import { useLocation } from "wouter";

// Real job title suggestions based on common professional roles
const jobTitleDatabase = [
  // Software Development
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Senior Software Engineer', 'Lead Software Engineer', 'Principal Software Engineer',
  'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Developer', 'Angular Developer',
  'Vue.js Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', 'C# Developer',
  'PHP Developer', 'Ruby Developer', 'Go Developer', 'Rust Developer', 'Swift Developer',
  'Kotlin Developer', 'Flutter Developer', 'React Native Developer', 'WordPress Developer',
  
  // Blockchain & Web3
  'Blockchain Developer', 'Solidity Developer', 'Smart Contract Developer', 'Web3 Developer',
  'Cryptocurrency Developer', 'DeFi Developer', 'NFT Developer', 'Ethereum Developer',
  
  // DevOps & Infrastructure
  'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Platform Engineer',
  'Infrastructure Engineer', 'Systems Engineer', 'Network Engineer', 'Security Engineer',
  'Kubernetes Engineer', 'Docker Engineer', 'AWS Engineer', 'Azure Engineer', 'GCP Engineer',
  
  // Data & AI
  'Data Scientist', 'Data Engineer', 'Data Analyst', 'Machine Learning Engineer',
  'AI Engineer', 'Deep Learning Engineer', 'MLOps Engineer', 'Data Architect',
  'Business Intelligence Analyst', 'Analytics Engineer', 'Big Data Engineer',
  
  // Design & Creative
  'UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer', 'Web Designer',
  'Visual Designer', 'Interaction Designer', 'Motion Graphics Designer', 'Brand Designer',
  'Creative Director', 'Art Director', 'Video Editor', 'Content Creator', 'Animator',
  
  // Product & Management
  'Product Manager', 'Senior Product Manager', 'Product Owner', 'Project Manager',
  'Program Manager', 'Technical Project Manager', 'Scrum Master', 'Agile Coach',
  'Product Marketing Manager', 'Growth Product Manager', 'Associate Product Manager',
  
  // Quality Assurance
  'Quality Assurance Engineer', 'QA Engineer', 'Test Engineer', 'Automation Engineer',
  'Software Tester', 'Performance Tester', 'Security Tester', 'Manual Tester',
  
  // Marketing & Sales
  'Digital Marketing Manager', 'Marketing Manager', 'Content Marketing Manager',
  'SEO Specialist', 'SEM Specialist', 'Social Media Manager', 'Email Marketing Specialist',
  'Performance Marketing Manager', 'Brand Manager', 'Marketing Analyst',
  'Sales Representative', 'Sales Manager', 'Account Executive', 'Business Development Manager',
  'Sales Development Representative', 'Customer Success Manager', 'Account Manager',
  
  // Business & Analytics
  'Business Analyst', 'Financial Analyst', 'Operations Analyst', 'Strategy Analyst',
  'Market Research Analyst', 'Investment Analyst', 'Risk Analyst', 'Compliance Analyst',
  
  // Operations & Support
  'Operations Manager', 'IT Support Specialist', 'Technical Support Engineer',
  'Customer Support Representative', 'Help Desk Technician', 'System Administrator',
  'Database Administrator', 'Network Administrator', 'Security Administrator',
  
  // Human Resources & Finance
  'HR Manager', 'HR Business Partner', 'Recruiter', 'Talent Acquisition Specialist',
  'HR Generalist', 'Compensation Analyst', 'Training Specialist', 'Employee Relations Specialist',
  'Financial Analyst', 'Accountant', 'Finance Manager', 'Treasury Analyst', 'Tax Analyst',
  
  // Content & Communication
  'Technical Writer', 'Content Writer', 'Copywriter', 'Content Strategist',
  'Communications Manager', 'PR Manager', 'Documentation Specialist', 'Editor',
  
  // Architecture & Leadership
  'Software Architect', 'Solutions Architect', 'Enterprise Architect', 'Cloud Architect',
  'Security Architect', 'Data Architect', 'Technical Lead', 'Engineering Manager',
  'CTO', 'VP of Engineering', 'Director of Engineering', 'Head of Product'
];

// Real world locations database
const locationDatabase = [
  // Remote Work
  'Remote', 'Remote Worldwide', 'Remote - US Only', 'Remote - Europe', 'Remote - Asia',
  
  // United States - Major Cities
  'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Seattle, WA',
  'Boston, MA', 'Austin, TX', 'Denver, CO', 'Atlanta, GA', 'Dallas, TX', 'Houston, TX',
  'Miami, FL', 'Washington, DC', 'Portland, OR', 'San Diego, CA', 'Philadelphia, PA',
  'Phoenix, AZ', 'Detroit, MI', 'Minneapolis, MN', 'Nashville, TN', 'Raleigh, NC',
  'Salt Lake City, UT', 'Kansas City, MO', 'Orlando, FL', 'Tampa, FL', 'Charlotte, NC',
  'Las Vegas, NV', 'Sacramento, CA', 'San Jose, CA', 'Columbus, OH', 'Indianapolis, IN',
  'Jacksonville, FL', 'San Antonio, TX', 'Fort Worth, TX', 'Baltimore, MD', 'Milwaukee, WI',
  
  // India - Major Cities & States
  'Mumbai, Maharashtra', 'Delhi, Delhi', 'Bangalore, Karnataka', 'Hyderabad, Telangana',
  'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Surat, Gujarat', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar',
  'Vadodara, Gujarat', 'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh',
  'Nashik, Maharashtra', 'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat',
  'Kalyan-Dombivali, Maharashtra', 'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh',
  'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra', 'Dhanbad, Jharkhand',
  'Amritsar, Punjab', 'Navi Mumbai, Maharashtra', 'Allahabad, Uttar Pradesh',
  'Ranchi, Jharkhand', 'Howrah, West Bengal', 'Coimbatore, Tamil Nadu', 'Jabalpur, Madhya Pradesh',
  'Gwalior, Madhya Pradesh', 'Vijayawada, Andhra Pradesh', 'Jodhpur, Rajasthan',
  'Madurai, Tamil Nadu', 'Raipur, Chhattisgarh', 'Kota, Rajasthan', 'Guwahati, Assam',
  'Chandigarh, Chandigarh', 'Solapur, Maharashtra', 'Hubli-Dharwad, Karnataka',
  'Tiruchirappalli, Tamil Nadu', 'Bareilly, Uttar Pradesh', 'Mysore, Karnataka',
  'Tiruppur, Tamil Nadu', 'Gurgaon, Haryana', 'Noida, Uttar Pradesh',
  
  // Indian States (for broader searches)
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'West Bengal',
  'Rajasthan', 'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Kerala', 'Punjab',
  'Haryana', 'Bihar', 'Odisha', 'Jharkhand', 'Assam', 'Chhattisgarh', 'Delhi',
  
  // Canada
  'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada', 'Calgary, Canada',
  'Edmonton, Canada', 'Ottawa, Canada', 'Winnipeg, Canada', 'Quebec City, Canada',
  'Hamilton, Canada', 'Kitchener, Canada', 'London, Canada', 'Halifax, Canada',
  
  // United Kingdom
  'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Leeds, UK', 'Glasgow, UK',
  'Liverpool, UK', 'Newcastle, UK', 'Sheffield, UK', 'Bristol, UK', 'Edinburgh, UK',
  'Leicester, UK', 'Coventry, UK', 'Bradford, UK', 'Cardiff, UK', 'Belfast, UK',
  
  // Germany
  'Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany', 'Frankfurt, Germany',
  'Cologne, Germany', 'Stuttgart, Germany', 'Düsseldorf, Germany', 'Dortmund, Germany',
  'Essen, Germany', 'Leipzig, Germany', 'Bremen, Germany', 'Dresden, Germany',
  
  // Australia
  'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia',
  'Adelaide, Australia', 'Gold Coast, Australia', 'Newcastle, Australia', 'Canberra, Australia',
  'Sunshine Coast, Australia', 'Wollongong, Australia', 'Hobart, Australia', 'Geelong, Australia',
  
  // Europe
  'Amsterdam, Netherlands', 'Paris, France', 'Barcelona, Spain', 'Madrid, Spain',
  'Dublin, Ireland', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Zurich, Switzerland',
  'Vienna, Austria', 'Prague, Czech Republic', 'Warsaw, Poland', 'Budapest, Hungary',
  'Rome, Italy', 'Milan, Italy', 'Brussels, Belgium', 'Oslo, Norway', 'Helsinki, Finland',
  'Lisbon, Portugal', 'Athens, Greece', 'Bucharest, Romania', 'Sofia, Bulgaria',
  
  // Asia-Pacific
  'Singapore', 'Tokyo, Japan', 'Hong Kong', 'Seoul, South Korea', 'Bangkok, Thailand',
  'Kuala Lumpur, Malaysia', 'Jakarta, Indonesia', 'Manila, Philippines', 'Ho Chi Minh City, Vietnam',
  'Taipei, Taiwan', 'Shanghai, China', 'Beijing, China', 'Shenzhen, China', 'Guangzhou, China',
  
  // Middle East & Africa
  'Tel Aviv, Israel', 'Dubai, UAE', 'Abu Dhabi, UAE', 'Riyadh, Saudi Arabia',
  'Kuwait City, Kuwait', 'Doha, Qatar', 'Cairo, Egypt', 'Cape Town, South Africa',
  'Johannesburg, South Africa', 'Lagos, Nigeria', 'Nairobi, Kenya', 'Casablanca, Morocco',
  
  // Latin America
  'São Paulo, Brazil', 'Mexico City, Mexico', 'Buenos Aires, Argentina', 'Bogotá, Colombia',
  'Lima, Peru', 'Santiago, Chile', 'Caracas, Venezuela', 'Guadalajara, Mexico',
  'Monterrey, Mexico', 'Rio de Janeiro, Brazil', 'Medellín, Colombia', 'Quito, Ecuador'
];

// Efficient search algorithm for job title suggestions
const getJobTitleSuggestions = (input: string): string[] => {
  if (!input || input.length < 2) return [];
  
  const query = input.toLowerCase();
  const suggestions = jobTitleDatabase
    .filter(title => title.toLowerCase().includes(query))
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Prioritize exact matches at the start
      const aStartsWithQuery = aLower.startsWith(query);
      const bStartsWithQuery = bLower.startsWith(query);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      
      // Then by length (shorter titles first)
      return a.length - b.length;
    })
    .slice(0, 8); // Limit to 8 suggestions
  
  return suggestions;
};

// Efficient search algorithm for location suggestions
const getLocationSuggestions = (input: string): string[] => {
  if (!input || input.length < 2) return [];
  
  const query = input.toLowerCase();
  const suggestions = locationDatabase
    .filter(location => location.toLowerCase().includes(query))
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Prioritize exact matches at the start
      const aStartsWithQuery = aLower.startsWith(query);
      const bStartsWithQuery = bLower.startsWith(query);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      
      // Then by length (shorter locations first)
      return a.length - b.length;
    })
    .slice(0, 8); // Limit to 8 suggestions
  
  return suggestions;
};

export default function Jobs() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('search') || '',
      location: params.get('location') || '',
      jobType: params.get('jobType') || '',
      experienceLevel: params.get('experienceLevel') || '',
      salaryMin: params.get('salaryMin') || '',
      salaryMax: params.get('salaryMax') || '',
      sortBy: params.get('sortBy') || 'date',
      page: parseInt(params.get('page') || '1'),
    };
  });

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { data: jobsData, isLoading } = useQuery<{ jobs: JobWithEmployer[]; total: number }>({
    queryKey: ['/api/jobs', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/jobs?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    },
  });

  const updateSearchParams = (updates: Partial<typeof searchParams>) => {
    const newParams = { ...searchParams, ...updates, page: 1 };
    setSearchParams(newParams);
    
    // Update URL
    const urlParams = new URLSearchParams();
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== '' && value !== 1) {
        urlParams.append(key, value.toString());
      }
    });
    
    const newUrl = urlParams.toString() ? `/jobs?${urlParams.toString()}` : '/jobs';
    window.history.replaceState({}, '', newUrl);
  };

  const handleSearch = () => {
    updateSearchParams({});
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    if (typeof value === 'boolean') {
      // For checkboxes, we'd need more complex logic
      return;
    }
    updateSearchParams({ [key]: value });
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'remote', label: 'Remote' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
  ];

  const salaryRanges = [
    { value: 'any', label: 'Any' },
    { value: '0-50000', label: '$0 - $50k' },
    { value: '50000-75000', label: '$50k - $75k' },
    { value: '75000-100000', label: '$75k - $100k' },
    { value: '100000-150000', label: '$100k - $150k' },
    { value: '150000', label: '$150k+' },
  ];

  const jobs = jobsData?.jobs || [];
  const totalJobs = jobsData?.total || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Jobs
                </h3>

                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Label className="text-sm font-bold text-foreground mb-2 block">Search</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          placeholder="Job title, keywords, or company..."
                          value={searchParams.search}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                        />
                        {searchParams.search && searchParams.search.length > 1 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {getJobTitleSuggestions(searchParams.search).map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b border-border last:border-b-0"
                                onClick={() => setSearchParams(prev => ({ ...prev, search: suggestion }))}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button onClick={handleSearch} size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Label className="text-sm font-bold text-foreground mb-2 block">Location</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="City, State or Remote"
                        value={searchParams.location}
                        onChange={(e) => updateSearchParams({ location: e.target.value })}
                      />
                      {searchParams.location && searchParams.location.length > 1 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {getLocationSuggestions(searchParams.location).map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b border-border last:border-b-0"
                              onClick={() => updateSearchParams({ location: suggestion })}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Type */}
                  <div>
                    <Label className="text-sm font-bold text-foreground mb-2">Job Type</Label>
                    <div className="space-y-2">
                      {jobTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={type.value}
                            checked={searchParams.jobType === type.value}
                            onCheckedChange={(checked) =>
                              handleFilterChange('jobType', checked ? type.value : '')
                            }
                          />
                          <Label htmlFor={type.value} className="text-sm">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <Label className="text-sm font-bold text-foreground mb-2">Experience Level</Label>
                    <div className="space-y-2">
                      {experienceLevels.map((level) => (
                        <div key={level.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={level.value}
                            checked={searchParams.experienceLevel === level.value}
                            onCheckedChange={(checked) =>
                              handleFilterChange('experienceLevel', checked ? level.value : '')
                            }
                          />
                          <Label htmlFor={level.value} className="text-sm">
                            {level.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <Label className="text-sm font-bold text-foreground mb-2">Salary Range</Label>
                    <Select
                      value={(() => {
                        // Determine the current selected value based on salary filters
                        if (!searchParams.salaryMin && !searchParams.salaryMax) return 'any';
                        if (searchParams.salaryMin && searchParams.salaryMax) {
                          return `${searchParams.salaryMin}-${searchParams.salaryMax}`;
                        }
                        if (searchParams.salaryMin && !searchParams.salaryMax) {
                          return searchParams.salaryMin;
                        }
                        return 'any';
                      })()}
                      onValueChange={(value) => {
                        if (value === 'any') {
                          updateSearchParams({ salaryMin: '', salaryMax: '' });
                        } else if (value.includes('-')) {
                          const [min, max] = value.split('-');
                          updateSearchParams({ salaryMin: min, salaryMax: max });
                        } else if (value) {
                          updateSearchParams({ salaryMin: value, salaryMax: '' });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSearch}
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Results */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Job Opportunities</h2>
                <p className="text-gray-600">
                  {isLoading ? 'Loading...' : `Showing ${jobs.length} of ${totalJobs} jobs`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select
                  value={searchParams.sortBy}
                  onValueChange={(value) => updateSearchParams({ sortBy: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="date">Newest First</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find more opportunities.
                  </p>
                  <Button onClick={() => updateSearchParams({ search: '', location: '', jobType: '', experienceLevel: '', salaryMin: '', salaryMax: '' })}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
                  : 'space-y-4'
              }`}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalJobs > 10 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button 
                  variant="outline" 
                  disabled={searchParams.page <= 1}
                  onClick={() => updateSearchParams({ page: searchParams.page - 1 })}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {searchParams.page} of {Math.ceil(totalJobs / 10)}
                </span>
                <Button 
                  variant="outline"
                  disabled={searchParams.page >= Math.ceil(totalJobs / 10)}
                  onClick={() => updateSearchParams({ page: searchParams.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
