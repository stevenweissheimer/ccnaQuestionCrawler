const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const jsonFilePath = path.join(__dirname, 'questions.json');
const coursesFilePath = path.join(__dirname, 'courses.json');
const imagesFolderPath = path.join(__dirname, 'public/images');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesFolderPath);
    },
    filename: function (req, file, cb) {
        const randomFileName = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        cb(null, randomFileName + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Funktion zum Berechnen der maximalen Anzahl von Antworten
function calculateMaxAnswers(questions) {
    let maxAnswers = 0;

    questions.forEach(question => {
        if (question.answers.length > maxAnswers) {
            maxAnswers = question.answers.length;
        }
    });

    return maxAnswers;
}

app.get('/', (req, res) => {
    const questions = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const courses = JSON.parse(fs.readFileSync(coursesFilePath, 'utf8')).courses;
    const maxAnswers = calculateMaxAnswers(questions); // Hinzufügen der maximalen Anzahl von Antworten
    res.render('questions', { questions, courses, maxAnswers });
});

app.post('/addQuestion', upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'answers[0][image]', maxCount: 1 },
    { name: 'answers[1][image]', maxCount: 1 },
    { name: 'answers[2][image]', maxCount: 1 },
    { name: 'answers[3][image]', maxCount: 1 },
    { name: 'answers[4][image]', maxCount: 1 },
    { name: 'answers[5][image]', maxCount: 1 }
]), (req, res) => {
    const { courseId, subCourseId, categoryId, question, answersDescription, questionText, answers } = req.body;

    // Überprüfen, ob die Antwortfelder befüllt sind
    const validAnswers = answers.filter(answer => answer.title.trim() !== '');

    if (validAnswers.length === 0) {
        return res.status(400).send('Mindestens eine Antwort muss befüllt sein.');
    }

    const courses = JSON.parse(fs.readFileSync(coursesFilePath, 'utf8')).courses;

    const selectedCourse = courses.find(course => course.courseId === parseInt(courseId));
    const selectedSubcourse = selectedCourse.subcourses.find(subcourse => subcourse.subCourseId === parseInt(subCourseId));
    const selectedCategory = selectedSubcourse.categories.find(category => category.categoryId === parseInt(categoryId));

    const timestamp = new Date(); // Aktuelles Datum und Uhrzeit

    const newQuestion = {
        courseId: selectedCourse.courseId,
        subCourseId: selectedSubcourse.subCourseId,
        categoryId: selectedCategory.categoryId,
        timestamp: timestamp.toISOString(), // ISO-Format für den Timestamp
        question,
        questionText,
        answersDescription,
        questionImage: req.files['questionImage'] ? req.files['questionImage'][0].filename : '',
        answers: validAnswers.map((answer, index) => ({
            id: Math.floor(1000000000 + Math.random() * 9000000000),
            title: answer.title,
            image: req.files[`answers[${index}][image]`] ? req.files[`answers[${index}][image]`][0].filename : '',
            correct: answer.correct === 'on'
        }))
    };

    const questions = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    questions.push(newQuestion);
    fs.writeFileSync(jsonFilePath, JSON.stringify(questions, null, 2), 'utf8');

    res.redirect('/');
});

// Endpunkt, um die Kursdaten zu senden
app.get('/courses', (req, res) => {
    const courses = JSON.parse(fs.readFileSync(coursesFilePath, 'utf8')).courses;
    res.json({ courses });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
