// dbRoutes.js
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

// Убедимся, что папка для бэкапов существует
const backupDirectory = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDirectory)) {
    fs.mkdirSync(backupDirectory, { recursive: true });
}

// Маршрут для приёма файла базы данных
router.post('/', upload.single('database'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Файл не получен. Проверьте имя поля.');
    }
    const dbPath = path.join(backupDirectory, req.file.originalname);

    fs.rename(req.file.path, dbPath, (err) => {
        if (err) {
            console.error('Ошибка при сохранении резервной копии:', err);
            return res.status(500).send('Ошибка при сохранении резервной копии');
        }
        console.log(`Резервная копия базы данных сохранена в ${dbPath}`);
        res.status(200).send('База данных загружена успешно');
    });
});

export default router;
