const fs = require('fs');

const jsonFilePath = 'questions.json';

function generateRandomQuestionId() {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000);
}

function fixMissingQuestionId(question) {
    if (!question.questionId) {
        question.questionId = generateRandomQuestionId();
    }
}

function fixQuestionsFile() {
    const questions = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    questions.forEach(question => {
        fixMissingQuestionId(question);

        // Move questionId to the beginning
        const { questionId, ...rest } = question;
        question = { questionId, ...rest };
    });

    fs.writeFileSync(jsonFilePath, JSON.stringify(questions, null, 2), 'utf8');
}

fixQuestionsFile();
