import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { Student } from '../models/Student';
import { createError } from '../middleware/errorHandler';

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    const { status, jobId, studentId, companyId } = req.query;

    if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user.userId }).lean();
      if (student) filter.studentId = student._id;
    } else if (req.user?.role === 'RECRUITER') {
      // Get jobs posted by this recruiter
      const jobs = await Job.find({ recruiterId: new mongoose.Types.ObjectId(req.user.userId) }).select('_id').lean();
      filter.jobId = { $in: jobs.map(j => j._id) };
    }

    if (status) filter.status = status;
    if (jobId) filter.jobId = new mongoose.Types.ObjectId(jobId as string);
    if (studentId) filter.studentId = new mongoose.Types.ObjectId(studentId as string);
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId as string);

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Application.find(filter)
        .populate('studentId', 'name email avatar department cgpa skills')
        .populate('jobId', 'title salaryMin salaryMax type')
        .populate('companyId', 'name logo industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        data: data.map(a => ({ ...a, id: a._id.toString() })),
        total, page, limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) { next(error); }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('studentId', 'name email avatar department cgpa skills')
      .populate('jobId', 'title salaryMin salaryMax type')
      .populate('companyId', 'name logo industry');
    if (!app) throw createError('Application not found', 404);
    res.json({ success: true, data: app });
  } catch (error) { next(error); }
};

export const applyToJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId } = req.body;

    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) throw createError('Student profile not found', 404);

    const job = await Job.findById(jobId);
    if (!job) throw createError('Job not found', 404);
    if (job.status !== 'active') throw createError('This job is not accepting applications', 400);

    // Check deadline
    if (new Date() > job.applicationDeadline) {
      throw createError('Application deadline has passed', 400);
    }

    // Check eligibility
    if (student.cgpa < job.eligibility.minCgpa) {
      throw createError(`Minimum CGPA ${job.eligibility.minCgpa} required`, 400);
    }
    if (student.backlogs > job.eligibility.maxBacklogs) {
      throw createError(`Maximum ${job.eligibility.maxBacklogs} backlogs allowed`, 400);
    }

    const application = await Application.create({
      studentId: student._id,
      jobId: job._id,
      companyId: job.companyId,
      status: 'applied',
      currentStage: 'Application Submitted',
      timeline: [{ stage: 'Application Submitted', status: 'current', date: new Date() }],
      isShortlisted: false,
    });

    // Update job stats
    await Job.findByIdAndUpdate(jobId, { $inc: { 'stats.applied': 1 } });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully!',
    });
  } catch (error) { next(error); }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, recruiterNotes } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) throw createError('Application not found', 404);

    app.status = status;
    if (recruiterNotes) app.recruiterNotes = recruiterNotes;

    app.timeline.push({
      stage: status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      status: ['rejected', 'withdrawn'].includes(status) ? 'failed' : 'current',
      date: new Date(),
    });

    await app.save();
    res.json({ success: true, data: app, message: 'Application status updated' });
  } catch (error) { next(error); }
};
