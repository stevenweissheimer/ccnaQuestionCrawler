const fs = require('fs');

// Lese die questions.json-Datei
const questionsFilePath = 'questions.json'; // Setze den tatsächlichen Pfad hier ein
const questions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));

// Filtere Fragen mit nur einer Antwort
const singleAnswerQuestions = questions.filter(question => question.answers.length === 1);

// Schreibe die gefilterten Fragen in eine separate Datei
const outputFilePath = 'singleAnswerQuestions.json'; // Setze den tatsächlichen Pfad hier ein
fs.writeFileSync(outputFilePath, JSON.stringify(singleAnswerQuestions, null, 2), 'utf8');

console.log('Verarbeitung abgeschlossen. Fragen mit nur einer Antwort wurden in die separate Datei geschrieben.');
