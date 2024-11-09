// routes.js
import express from 'express';
import dbRoutes from './services/dbRoutes.js';
import logRoutes from './services/logRoutes.js';

const router = express.Router();

// Подключаем маршруты для базы данных
router.use('/upload-db', dbRoutes);

// Подключаем маршруты для логов
router.use('/upload-log', logRoutes);

export default router;
