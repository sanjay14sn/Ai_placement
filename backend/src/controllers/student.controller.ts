import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { College } from '../models/College';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { createError } from '../middleware/errorHandler';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const updateStudentSchema = z.object({
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  linkedIn: z.string().url().optional(),
  github: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  preferredLocations: z.array(z.string()).optional(),
  preferredRoles: z.array(z.string()).optional(),
  expectedSalary: z.number().min(0).optional(),
  address: z.object({
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }).optional(),
  certifications: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
}).partial();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildQuery = (req: Request) => {
  const filter: Record<string, unknown> = {};

  // Scope to college for non-super-admin when authenticated
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) {
    if (req.user.tenantId !== 'college-1') {
      try {
        filter.collegeId = new mongoose.Types.ObjectId(req.user.tenantId);
      } catch {
        filter.collegeId = new mongoose.Types.ObjectId("000000000000000000000000");
      }
    }
  }

  // If collegeId is passed as query param (unauthenticated admin calls), use it
  if (!req.user && req.query.collegeId) {
    try {
      filter.collegeId = new mongoose.Types.ObjectId(req.query.collegeId as string);
    } catch { /* ignore invalid id */ }
  }

  const { search, department, placementStatus, batch, isEligible } = req.query;

  if (search) {
    filter['$or'] = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) filter.department = { $regex: `^${department}$`, $options: 'i' };
  if (placementStatus) filter.placementStatus = placementStatus;
  if (batch) filter.batch = batch;
  if (isEligible !== undefined) filter.isEligible = isEligible === 'true';

  return filter;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/students
 * Admin-side: directly create a student (no OTP, no email verification).
 * Automatically creates a linked User account with a default password.
 */
export const createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name, email, phone, studentId, collegeId, departmentId,
      department, batch, degree, cgpa = 0, gender = 'male',
      skills = [],
    } = req.body as Record<string, string | number | string[]>;

    if (!name || !email || !studentId || !collegeId || !department || !batch || !degree) {
      throw createError('Missing required fields: name, email, studentId, collegeId, department, batch, degree', 400);
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: (email as string).toLowerCase() });
    if (existingUser) throw createError('A user with this email already exists', 409);

    // Validate college exists
    const college = await College.findById(collegeId);
    if (!college) throw createError('College not found', 404);

    // Resolve departmentId (may be undefined for admin-created students)
    let resolvedDeptId: mongoose.Types.ObjectId;
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId as string)) {
      resolvedDeptId = new mongoose.Types.ObjectId(departmentId as string);
    } else {
      // Create a placeholder ObjectId (not a real dept lookup)
      resolvedDeptId = new mongoose.Types.ObjectId();
    }

    // Create a User account with default password (student can reset later)
    const defaultPassword = 'Student@123';

    const user = await User.create({
      email: (email as string).toLowerCase(),
      passwordHash: defaultPassword,
      name,
      role: 'STUDENT',
      tenantId: new mongoose.Types.ObjectId(collegeId as string),
      phone: phone || '',
      isEmailVerified: true, // admin-added students are pre-verified
      isActive: true,
    });

    const numericCgpa = Number(cgpa) || 0;

    // Create Student profile
    const student = await Student.create({
      userId: user._id,
      collegeId: new mongoose.Types.ObjectId(collegeId as string),
      departmentId: resolvedDeptId,
      studentId,
      name,
      email: (email as string).toLowerCase(),
      phone: phone || '',
      department,
      batch,
      degree,
      cgpa: numericCgpa,
      gender,
      isEligible: numericCgpa >= 6.5,
      placementStatus: 'not_placed',
      placementReadinessScore: 30,
      profileCompletion: 35,
      skills: Array.isArray(skills) ? skills : [],
      preferredLocations: [],
      preferredRoles: [],
      expectedSalary: 0,
      certifications: [],
      projects: [],
      education: [
        {
          id: `edu-${Date.now()}`,
          level: 'graduation',
          institution: college.name,
          degree,
          specialization: department as string,
          score: numericCgpa,
          scoreType: 'cgpa',
          yearOfPassing: parseInt(batch as string) || 2025,
          location: college.city,
        },
      ],
      experience: [],
    });

    const doc = student.toObject();
    res.status(201).json({
      success: true,
      data: { ...doc, id: doc._id.toString() },
      message: 'Student created successfully. Default password: Student@123',
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/students
 * For COLLEGE_ADMIN, TPO: their college's students
 * For SUPER_ADMIN: all students
 */
export const getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter = buildQuery(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Student.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        data: data.map(s => ({ ...s, id: s._id.toString() })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/stats
 */
export const getStudentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) {
      filter.collegeId = new mongoose.Types.ObjectId(req.user.tenantId);
    }

    const [total, eligible, placed, withResume, profileComplete, cgpaAgg] = await Promise.all([
      Student.countDocuments(filter),
      Student.countDocuments({ ...filter, isEligible: true }),
      Student.countDocuments({ ...filter, placementStatus: 'placed' }),
      Student.countDocuments({ ...filter, 'resume.fileUrl': { $exists: true } }),
      Student.countDocuments({ ...filter, profileCompletion: { $gte: 80 } }),
      Student.aggregate([
        { $match: filter },
        { $group: { _id: null, avgCgpa: { $avg: '$cgpa' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        eligible,
        placed,
        withResume,
        profileComplete,
        avgCgpa: cgpaAgg[0]?.avgCgpa?.toFixed(2) || '0.00',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/me
 * Student's own profile
 */
export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) throw createError('Student profile not found', 404);
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/me/dashboard
 * Aggregates data for the student dashboard.
 */
export const getStudentDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) throw createError('Student profile not found', 404);

    // 1. Job Matches (Simple mock logic: jobs that require at least one skill the student has)
    // To keep it performant, we just count jobs where skills intersect or return a static high match count for now if student has no skills
    let matchedJobsCount = 0;
    if (student.skills && student.skills.length > 0) {
      matchedJobsCount = await Job.countDocuments({
        status: 'published',
        skills: { $in: student.skills },
      });
    } else {
      matchedJobsCount = await Job.countDocuments({ status: 'published' });
    }

    // 2. Application Pipeline & KPIs
    const applications = await Application.find({ studentId: student._id }).populate('jobId', 'title company').sort({ updatedAt: -1 }).lean();
    
    let appliedCount = 0;
    let shortlistedCount = 0;
    let interviewCount = 0;
    let selectedCount = 0;
    let underReviewCount = 0;

    applications.forEach(app => {
      appliedCount++;
      if (app.isShortlisted || app.status === 'shortlisted') shortlistedCount++;
      if (['assessment', 'technical', 'hr'].includes(app.status)) interviewCount++;
      if (app.status === 'selected') selectedCount++;
      if (app.status === 'under_review') underReviewCount++;
    });

    const pipeline = [
      { stage: 'Applied', count: appliedCount, color: 'bg-brand-500', percent: appliedCount > 0 ? 100 : 0 },
      { stage: 'Under Review', count: underReviewCount, color: 'bg-amber-500', percent: appliedCount > 0 ? Math.round((underReviewCount / appliedCount) * 100) : 0 },
      { stage: 'Shortlisted', count: shortlistedCount, color: 'bg-ai-500', percent: appliedCount > 0 ? Math.round((shortlistedCount / appliedCount) * 100) : 0 },
      { stage: 'Interview', count: interviewCount, color: 'bg-blue-500', percent: appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0 },
      { stage: 'Selected', count: selectedCount, color: 'bg-emerald-500', percent: appliedCount > 0 ? Math.round((selectedCount / appliedCount) * 100) : 0 },
    ];

    // 3. Recent Activity (map from latest applications/timeline)
    const recentActivity = applications.slice(0, 5).map(app => {
      let text = `Applied to ${app.jobId ? (app.jobId as any).title : 'Job'}`;
      let type = 'application';
      
      if (app.status === 'selected') {
        text = `Selected for ${app.jobId ? (app.jobId as any).title : 'Job'}`;
        type = 'success';
      } else if (['assessment', 'technical', 'hr'].includes(app.status)) {
        text = `Interview scheduled for ${app.jobId ? (app.jobId as any).title : 'Job'}`;
        type = 'interview';
      } else if (app.isShortlisted || app.status === 'shortlisted') {
        text = `Shortlisted for ${app.jobId ? (app.jobId as any).title : 'Job'}`;
        type = 'success';
      }
      
      return {
        text,
        time: new Date(app.updatedAt).toLocaleDateString(),
        type,
      };
    });

    // 4. Portals
    const portals = student.jobPortals || [];
    const defaultPortals = ['LinkedIn', 'Indeed', 'Glassdoor', 'Naukri.com', 'Unstop', 'Wellfound'];
    const connectedPortals = defaultPortals.map(name => {
      const p = portals.find(p => p.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        connected: !!p?.connected,
        id: p?.portalId || 'Not Connected',
      };
    });

    res.json({
      success: true,
      data: {
        kpis: {
          appliedJobs: appliedCount,
          shortlisted: shortlistedCount,
          interviews: interviewCount,
          jobMatches: matchedJobsCount,
        },
        pipeline,
        recentActivity,
        portals: connectedPortals,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id
 */
export const getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw createError('Student not found', 404);
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/:id
 * Students can update their own profile; admins can update any in their college
 */
export const updateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw createError('Student not found', 404);

    // Students can only update their own profile
    if (req.user?.role === 'STUDENT') {
      const ownStudent = await Student.findOne({ userId: req.user.userId });
      if (!ownStudent || ownStudent._id.toString() !== req.params.id) {
        throw createError('You can only update your own profile', 403);
      }
    }

    const updates = req.body;
    Object.assign(student, updates);

    // Recalculate profile completion
    let completion = 30;
    if (student.phone) completion += 5;
    if (student.skills.length >= 3) completion += 10;
    if (student.education.length > 0) completion += 10;
    if (student.projects.length > 0) completion += 15;
    if (student.certifications.length > 0) completion += 10;
    if (student.resume?.fileUrl) completion += 15;
    if (student.linkedIn) completion += 5;
    completion = Math.min(completion, 100);
    student.profileCompletion = completion;

    await student.save();
    res.json({ success: true, data: student, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/students/:id
 */
export const deleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw createError('Student not found', 404);

    // Also delete associated user
    await User.findByIdAndDelete(student.userId);
    await student.deleteOne();

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};
