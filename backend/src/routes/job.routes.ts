import { Router } from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob } from '../controllers/job.controller';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
