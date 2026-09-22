import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { College } from '../models/College';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';

export const getColleges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) {
      filter._id = new mongoose.Types.ObjectId(req.user.tenantId);
    }

    const { search } = req.query;
    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      College.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      College.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { data: data.map(c => ({ ...c, id: c._id.toString() })), total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

export const getCollegeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) throw createError('College not found', 404);
    res.json({ success: true, data: college });
  } catch (error) { next(error); }
};

export const updateCollege = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // College admins can only update their own college
    if (req.user?.role === 'COLLEGE_ADMIN' && req.user.tenantId !== req.params.id) {
      throw createError('Access denied', 403);
    }
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!college) throw createError('College not found', 404);
    res.json({ success: true, data: college });
  } catch (error) { next(error); }
};

export const toggleCollegeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) throw createError('College not found', 404);
    college.isActive = !college.isActive;
    await college.save();
    res.json({ success: true, data: college });
  } catch (error) { next(error); }
};

export const createCollege = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, city, state, establishedYear, tpoName, tpoEmail, tpoPhone, password, plan } = req.body;
    
    if (!name || !code || !tpoEmail || !password) {
      throw createError('Name, Code, TPO Email, and Password are required', 400);
    }

    const existingCollege = await College.findOne({ code: code.toUpperCase() });
    if (existingCollege) throw createError('College code already registered', 400);

    const existingUser = await User.findOne({ email: tpoEmail.toLowerCase() });
    if (existingUser) throw createError('TPO email already registered', 400);

    // 1. Create College
    const college = await College.create({
      name,
      code: code.toUpperCase(),
      city: city || 'Unknown',
      state: state || 'State',
      establishedYear: parseInt(establishedYear || '2000', 10),
      tpoName: tpoName || 'College Admin',
      tpoEmail: tpoEmail.toLowerCase(),
      tpoPhone: tpoPhone || '',
      isActive: true,
      subscription: {
        plan: plan || 'starter',
        status: 'active',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        studentsUsed: 0,
        studentsLimit: plan === 'enterprise' ? 10000 : plan === 'professional' ? 5000 : 1000,
        aiCreditsUsed: 0,
        aiCreditsLimit: plan === 'enterprise' ? 50000 : plan === 'professional' ? 20000 : 5000,
        recruitersUsed: 0,
        recruitersLimit: 100,
        jobsUsed: 0,
        jobsLimit: 500,
      }
    });

    // 2. Create College Admin User Account
    const hashedPassword = await bcrypt.hash(password, 12);
    const adminUser = await User.create({
      name: tpoName || `${name} Admin`,
      email: tpoEmail.toLowerCase(),
      password: hashedPassword,
      role: 'COLLEGE_ADMIN',
      tenantId: college._id,
      isActive: true,
      emailVerified: true,
    });

    const collegeData = college.toJSON() as Record<string, unknown>;
    collegeData.id = college._id.toString();

    res.status(201).json({
      success: true,
      message: 'College and College Admin account created successfully',
      data: {
        college: collegeData,
        adminUser: {
          id: adminUser._id.toString(),
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        }
      }
    });
  } catch (error) { next(error); }
};

