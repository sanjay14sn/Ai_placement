import { Router } from 'express';
import { getDrives, getDriveById, createDrive, updateDrive } from '../controllers/drive.controller';

const router = Router();

router.get('/', getDrives);
router.get('/:id', getDriveById);
router.post('/', createDrive);
router.put('/:id', updateDrive);

export default router;
