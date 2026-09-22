import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { PlacementDrive } from '../models/PlacementDrive';
import { createError } from '../middleware/errorHandler';

export const getDrives = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const mapDrive = (d: any) => ({
    ...d,
    id: d._id?.toString(),
    company: d.companyId ? { id: d.companyId._id?.toString(), name: d.companyId.name, logo: d.companyId.logo, industry: d.companyId.industry } : undefined,
    companyId: d.companyId?._id?.toString() || d.companyId,
    job: d.jobId ? { id: d.jobId._id?.toString(), title: d.jobId.title, salaryMin: d.jobId.salaryMin, salaryMax: d.jobId.salaryMax, type: d.jobId.type } : undefined,
    jobId: d.jobId?._id?.toString() || d.jobId,
  });

  try {
    const filter: Record<string, unknown> = {};
    const { status } = req.query;

    if (req.user?.tenantId && req.user.role !== 'SUPER_ADMIN') {
      filter.collegeId = new mongoose.Types.ObjectId(req.user.tenantId);
    }
    if (status) filter.status = status;

    const drives = await PlacementDrive.find(filter)
      .populate('companyId', 'name logo industry')
      .populate('jobId', 'title salaryMin salaryMax type')
      .sort({ date: 1 })
      .lean();

    res.json({ success: true, data: drives.map(mapDrive) });
  } catch (error) { next(error); }
};

export const getDriveById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('companyId', 'name logo industry')
      .populate('jobId', 'title salaryMin salaryMax type')
      .lean();
    if (!drive) throw createError('Drive not found', 404);
    
    const mapDrive = (d: any) => ({
      ...d,
      id: d._id?.toString(),
      company: d.companyId ? { id: d.companyId._id?.toString(), name: d.companyId.name, logo: d.companyId.logo, industry: d.companyId.industry } : undefined,
      companyId: d.companyId?._id?.toString() || d.companyId,
      job: d.jobId ? { id: d.jobId._id?.toString(), title: d.jobId.title, salaryMin: d.jobId.salaryMin, salaryMax: d.jobId.salaryMax, type: d.jobId.type } : undefined,
      jobId: d.jobId?._id?.toString() || d.jobId,
    });

    res.json({ success: true, data: mapDrive(drive) });
  } catch (error) { next(error); }
};

export const createDrive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.create({
      ...req.body,
      collegeId: req.body.collegeId || req.user?.tenantId,
    });
    
    // Inject the frontend-provided company and job objects back into the response
    // so the UI doesn't crash when immediately rendering the new drive
    const driveData = {
      ...drive.toObject(),
      id: drive._id.toString(),
      company: req.body.company,
      job: req.body.job
    };
    
    res.status(201).json({ success: true, data: driveData, message: 'Placement drive created' });
  } catch (error) { next(error); }
};

export const updateDrive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drive) throw createError('Drive not found', 404);
    res.json({ success: true, data: drive });
  } catch (error) { next(error); }
};
