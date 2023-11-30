const fs = require('fs');

// Lese die questions.json-Datei
const questionsFilePath = 'questions.json'; // Setze den tatsächlichen Pfad hier ein
const questions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));

// Filtere Fragen ohne questionImage
const questionsWithoutImage = questions.filter(question => {
    const hasExhibitExpression = /Refer to the exhibit\./;
    
    if (question.question.match(hasExhibitExpression) || question.questionText.match(hasExhibitExpression)) {
        return !question.questionImage;
    }

    return false;
});

// Schreibe die gefilterten Fragen in eine separate Datei
const outputFilePath = 'questionsWithoutImage.json'; // Setze den tatsächlichen Pfad hier ein
fs.writeFileSync(outputFilePath, JSON.stringify(questionsWithoutImage, null, 2), 'utf8');

console.log('Verarbeitung abgeschlossen. Fragen ohne questionImage wurden in die separate Datei geschrieben.');
