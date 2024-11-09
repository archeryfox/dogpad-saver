// logRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Конфигурация multer для загрузки файлов
const upload = multer({
    dest: 'uploads/', // или указать конкретную директорию для сохранения файлов
    limits: { fileSize: 10 * 1024 * 1024 } // Например, ограничение по размеру файла
});

// Убедимся, что папка для логов существует
const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

router.post('/', upload.single('logfile'), (req, res) => {
    if (!req.file) {
        console.log('Ошибка: файл не передан');
        return res.status(400).send('Файл не получен. Проверьте имя поля.');
    }
    console.log('Файл передан:', req.file); // Отладочная информация

    const logPath = path.join(logDirectory, req.file.originalname);
    fs.rename(req.file.path, logPath, (err) => {
        if (err) {
            console.error('Ошибка при сохранении лог-файла:', err);
            return res.status(500).send('Ошибка при сохранении лог-файла');
        }
        console.log(`Лог-файл сохранён в ${logPath}`);
        res.status(200).send('Лог-файл загружен успешно');
    });
});

export default router;
