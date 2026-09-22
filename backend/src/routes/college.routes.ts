import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getColleges, getCollegeById, updateCollege, toggleCollegeStatus, createCollege } from '../controllers/college.controller';

const router = Router();

router.get('/', getColleges);
router.post('/', createCollege);
router.get('/:id', getCollegeById);
router.put('/:id', updateCollege);
router.patch('/:id/toggle-status', toggleCollegeStatus);

export default router;
