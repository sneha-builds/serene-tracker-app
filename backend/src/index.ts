import { Router } from 'express';
import aiRoutes from './controllers/ai';

const apiRouter = Router();

apiRouter.use('/ai', aiRoutes);

export default apiRouter;
