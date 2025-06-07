import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertJobSchema, insertApplicationSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // User routes
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = parseInt(req.params.id);
    if (req.session.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const updateSchema = z.object({
        username: z.string().min(2).optional(),
        email: z.string().email().optional(),
        role: z.enum(["job_seeker", "employer"]).optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Check if email is being changed and if it already exists
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      const updatedUser = await storage.updateUser(userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session with new role if it changed
      if (validatedData.role) {
        req.session.userRole = validatedData.role;
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Job routes - fetches real job data from API
  app.get("/api/jobs", async (req, res) => {
    try {
      const {
        search,
        location,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        skills,
        page = "1",
        limit = "20",
        sortBy = "date"
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        location: location as string,
        jobType: jobType as string,
        experienceLevel: experienceLevel as string,
        salaryMin: salaryMin ? parseInt(salaryMin as string) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax as string) : undefined,
        skills: skills ? (skills as string).split(',') : undefined,
        limit: limitNum,
        offset,
        sortBy: sortBy as 'relevance' | 'date' | 'salary-high' | 'salary-low',
      };

      // Fetch real jobs from external API
      const realJobs = await fetchRealJobs(filters);
      
      if (realJobs.length > 0) {
        return res.json({ jobs: realJobs, total: realJobs.length });
      }

      // Fallback to local storage if API fails
      const result = await storage.getJobs(filters);
      res.json(result);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  // Function to fetch real jobs from RapidAPI
  async function fetchRealJobs(filters: any) {
    try {
      const rapidApiKey = process.env.RAPID_API_KEY;
      if (!rapidApiKey) {
        console.log("No RapidAPI key found");
        return [];
      }

      // Build search query
      const query = filters.search || 'software engineer';
      const location = filters.location || 'remote';
      
      const url = 'https://jsearch.p.rapidapi.com/search';
      const params = new URLSearchParams({
        query: `${query} in ${location}`,
        page: '1',
        num_pages: '1',
        date_posted: 'all'
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        console.error(`API request failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        return [];
      }

      // Transform API data to match our job schema
      return data.data.slice(0, filters.limit || 20).map((job: any, index: number) => ({
        id: `api-${Date.now()}-${index}`,
        title: job.job_title || 'Software Engineer',
        company: job.employer_name || 'Company',
        location: job.job_city && job.job_state 
          ? `${job.job_city}, ${job.job_state}` 
          : job.job_country || location,
        jobType: job.job_employment_type || 'full-time',
        experienceLevel: job.job_required_experience?.required_experience_in_months 
          ? (job.job_required_experience.required_experience_in_months > 60 ? 'senior' : 
             job.job_required_experience.required_experience_in_months > 24 ? 'mid' : 'entry')
          : 'mid',
        salaryMin: job.job_min_salary || null,
        salaryMax: job.job_max_salary || null,
        description: job.job_description || 'Job description not available',
        requirements: job.job_highlights?.Qualifications?.join(', ') || '',
        skills: job.job_highlights?.Skills?.join(',') || '',
        benefits: job.job_highlights?.Benefits?.join(', ') || '',
        postedAt: job.job_posted_at_datetime_utc 
          ? new Date(job.job_posted_at_datetime_utc) 
          : new Date(),
        status: 'active',
        employerId: 1,
        updatedAt: new Date(),
        employer: {
          id: `emp-${Date.now()}-${index}`,
          username: job.employer_name?.toLowerCase().replace(/\s+/g, '') || 'company',
          email: `contact@${job.employer_name?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`,
          role: 'employer',
          createdAt: new Date()
        }
      }));
    } catch (error) {
      console.error("Error fetching real jobs:", error);
      return [];
    }
  }

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ message: "Failed to get job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Convert deadline string to Date if provided
      const jobData = { ...req.body };
      if (jobData.deadline && typeof jobData.deadline === 'string') {
        jobData.deadline = new Date(jobData.deadline);
      }
      
      const validatedData = insertJobSchema.parse(jobData);
      
      const job = await storage.createJob({
        ...validatedData,
        employerId: req.session.userId,
      });

      res.json(job);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const validatedData = insertJobSchema.partial().parse(req.body);
      
      const job = await storage.updateJob(jobId, validatedData);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Update job error:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const success = await storage.deleteJob(jobId);
      
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Application routes
  app.post("/api/applications", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'job_seeker') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        candidateId: req.session.userId,
      });

      // Check if application already exists
      const exists = await storage.getApplicationExists(validatedData.jobId, validatedData.candidateId);
      if (exists) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }

      const application = await storage.createApplication(validatedData);
      res.json(application);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.get("/api/applications/job/:jobId", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.jobId);
      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Get applications by job error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  app.get("/api/applications/candidate/:candidateId", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Users can only view their own applications or employers can view any
    const candidateId = parseInt(req.params.candidateId);
    if (req.session.userRole === 'job_seeker' && req.session.userId !== candidateId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const applications = await storage.getApplicationsByCandidate(candidateId);
      res.json(applications);
    } catch (error) {
      console.error("Get applications by candidate error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  app.get("/api/applications/employer/:employerId", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const employerId = parseInt(req.params.employerId);
    if (req.session.userId !== employerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const jobs = await storage.getJobsByEmployer(employerId);
      const allApplications = [];
      
      for (const job of jobs) {
        const applications = await storage.getApplicationsByJob(job.id);
        allApplications.push(...applications);
      }
      
      res.json(allApplications);
    } catch (error) {
      console.error("Get applications by employer error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  app.delete("/api/applications/:jobId", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'job_seeker') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.jobId);
      const candidateId = req.session.userId;
      
      const success = await storage.deleteApplication(jobId, candidateId);
      if (success) {
        res.json({ message: "Application deleted successfully" });
      } else {
        res.status(404).json({ message: "Application not found" });
      }
    } catch (error) {
      console.error("Delete application error:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  app.put("/api/applications/:id/status", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      const application = await storage.updateApplicationStatus(applicationId, status);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Candidate search routes
  app.get("/api/candidates", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'employer') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const {
        search,
        skills,
        experience,
        location,
        page = "1",
        limit = "10"
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        search: search as string,
        skills: skills ? (skills as string).split(',') : undefined,
        experience: experience as string,
        location: location as string,
        limit: limitNum,
        offset,
      };

      const result = await storage.searchCandidates(filters);
      res.json(result);
    } catch (error) {
      console.error("Search candidates error:", error);
      res.status(500).json({ message: "Failed to search candidates" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Profile routes
  app.put("/api/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { profileData, ...otherUpdates } = req.body;
      
      const user = await storage.updateUser(req.session.userId, {
        ...otherUpdates,
        profileData,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
