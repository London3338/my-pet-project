const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Настройка транспортера для отправки писем
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Создание базы данных и таблицы
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY, api TEXT, name TEXT, email TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.post('/submit', (req, res) => {
    const { name, email, message } = req.body;
    const api = req.body.api || 'N/A';

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent:', info.response);

        // Сохранение данных в базе данных
        const stmt = db.prepare("INSERT INTO submissions (api, name, email, message) VALUES (?, ?, ?, ?)");
        stmt.run(api, name, email, message, function(err) {
            if (err) {
                return res.status(500).send('Error saving submission');
            }
            res.status(200).send('Email sent successfully');
        });
        stmt.finalize();
    });
});

app.get('/submissions', (req, res) => {
    db.all("SELECT id, api, name, email, message, timestamp FROM submissions", [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error retrieving submissions');
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
