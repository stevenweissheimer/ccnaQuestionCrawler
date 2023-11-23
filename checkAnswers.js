const fs = require('fs');

const jsonFilePath = 'questions.json';
const outputFilePath = 'questions_with_no_correct_answers.json';

function filterQuestionsWithNoCorrectAnswers(questions) {
    return questions.filter(question => {
        const hasCorrectAnswer = question.answers.some(answer => answer.correct);
        return !hasCorrectAnswer;
    });
}

function saveQuestionsToFile(questions, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
}

function processQuestions() {
    const questions = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const questionsWithNoCorrectAnswers = filterQuestionsWithNoCorrectAnswers(questions);

    saveQuestionsToFile(questionsWithNoCorrectAnswers, outputFilePath);
}

processQuestions();
