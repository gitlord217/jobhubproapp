import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Briefcase, Users, TrendingUp, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeywords) params.append('search', searchKeywords);
    if (searchLocation) params.append('location', searchLocation);
    
    window.location.href = `/jobs?${params.toString()}`;
  };

  const quickSearches = [
    "Software Engineer",
    "Product Manager", 
    "Data Scientist",
    "UX Designer"
  ];

  const handleQuickSearch = (term: string) => {
    setSearchKeywords(term);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your Next{" "}
              <span className="text-primary">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with top employers and discover opportunities that match your skills and aspirations.
              Join thousands of professionals finding their perfect career fit.
            </p>

            {/* Search Form */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Location"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 font-medium"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search Jobs
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">Popular searches:</span>
                  {quickSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="text-primary hover:underline"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">15,000+</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">2,500+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50,000+</div>
              <div className="text-gray-600">Job Seekers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">8,000+</div>
              <div className="text-gray-600">Successful Hires</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose JobConnect Pro?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and powered by PostgreSQL for scalable, flexible job matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 rounded-lg p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Job Matching</h3>
                <p className="text-gray-600">
                  Our advanced algorithm matches you with relevant opportunities based on your skills and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-secondary/10 rounded-lg p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Top Employers</h3>
                <p className="text-gray-600">
                  Connect with leading companies and startups looking for talented professionals like you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-accent/10 rounded-lg p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
                <p className="text-gray-600">
                  Access analytics, salary insights, and career advice to advance your professional journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and find your perfect job match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Build a comprehensive profile showcasing your skills, experience, and career goals.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Search & Apply</h3>
              <p className="text-gray-600">
                Browse thousands of job opportunities and apply with one click to positions that interest you.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Hired</h3>
              <p className="text-gray-600">
                Connect with employers, ace your interviews, and land your dream job.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/register">
                Get Started Today
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="h-8 w-8 text-primary mr-2" />
                <h3 className="text-xl font-bold">JobConnect Pro</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting top talent with amazing opportunities. Built with PostgreSQL for scalable, flexible job matching.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Job Seekers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link href="/applications" className="hover:text-white transition-colors">My Applications</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/candidates" className="hover:text-white transition-colors">Search Candidates</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JobConnect Pro. All rights reserved. Powered by PostgreSQL.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
