const fs = require('fs');

// Lese die questions.json-Datei
const questionsFilePath = 'questions.json'; // Setze den tatsächlichen Pfad hier ein
const questions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));

// Filtere Fragen, die den Regeln nicht entsprechen
const invalidChoiceQuestions = questions.filter(question => {
    const choiceExpression = /Choose (two|three)/;
    const match = question.question.match(choiceExpression);

    if (match) {
        const expectedCorrectAnswers = match[1] === 'two' ? 2 : 3;
        const actualCorrectAnswers = question.answers.filter(answer => answer.correct).length;

        return actualCorrectAnswers !== expectedCorrectAnswers;
    }

    return false;
});

// Schreibe die gefilterten Fragen in eine separate Datei
const outputFilePath = 'invalidChoiceQuestions.json'; // Setze den tatsächlichen Pfad hier ein
fs.writeFileSync(outputFilePath, JSON.stringify(invalidChoiceQuestions, null, 2), 'utf8');

console.log('Verarbeitung abgeschlossen. Fragen, die den Regeln nicht entsprechen, wurden in die separate Datei geschrieben.');
