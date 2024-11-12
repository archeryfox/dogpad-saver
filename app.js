// server.js
import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import cors from 'cors';
import routes from './routes.js';
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 4000;

// Получаем директорию аналогично __dirname для ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, 'logs'); // Папка с логами
// Получаем директорию аналогично __dirname для ES Modules
const BACKUP_DIR = path.join(__dirname, 'backups'); // Папка с бекапами

app.use(cors({credentials: true, origin: true}));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.text({type: '*'}));

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Что-то пошло не так!');
});

// Получение списка лог-файлов
app.get('/logs', (req, res) => {
    fs.readdir(LOGS_DIR, (err, files) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении директории логов');
        }

        // Фильтруем только .log файлы
        const logFiles = files.filter(file => file.endsWith('.log')).map(flname => `${req.protocol}://${req.get('host')}${req.originalUrl}/${flname}`);
        res.json(logFiles);
    });
});

// Просмотр содержимого конкретного лог-файла
app.get('/logs/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(LOGS_DIR, filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('Лог-файл не найден');
        }
        res.send(`<pre>${data}</pre>`); // Отправляем содержимое файла в формате HTML
    });
});

// Получение списка файлов бекапа
app.get('/backups', (req, res) => {
    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении директории бекапов');
        }

        // Фильтруем только .sql или другие форматы файлов бекапа
        const backupFiles = files.filter(file => file.endsWith('.db') || file.endsWith('.zip')).map(fileName => {
            return `${req.protocol === 'http' && req.get('host') !== 'localhost' 
                ? 'https' 
                : req.protocol}://${req.get('host')}/backups/${encodeURIComponent(fileName)}`
        });
        res.json(backupFiles);
    });
});

// Просмотр содержимого конкретного файла бекапа
app.get('/backups/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(BACKUP_DIR, filename);

    // Проверяем, существует ли файл
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('Файл бекапа не найден');
        }

        // Отправляем файл для скачивания
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).send('Ошибка при скачивании файла');
            }
        });
    });
});


// Подключаем маршруты
app.use(routes);

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
