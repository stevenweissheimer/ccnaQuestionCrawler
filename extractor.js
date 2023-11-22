const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const linksFilePath = 'links.json';
const jsonsFolderPath = 'jsons';
const imagesFolderPath = 'Images';

function readLinks() {
  const linksData = JSON.parse(fs.readFileSync(linksFilePath, 'utf-8'));
  return linksData.links;
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 12);
}

function downloadImage(url, imagePath) {
  return axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(fs.createWriteStream(imagePath));

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve();
      });

      response.data.on('error', (err) => {
        reject(err);
      });
    });
  });
}

function extractData(url, course, section) {
  return axios.get(url).then(response => {
    const $ = cheerio.load(response.data);

    const questions = [];

    $('p strong, strong').each((index, element) => {
      const questionText = $(element).text().replace(/\s+/g, ' ').trim();

      // Check if the question starts with a number followed by a dot
      if (/^\d+\./.test(questionText)) {
        const questionId = generateRandomId();

        const isImageQuestion = $(element).parent().find('img').length > 0;
        const imagePath = isImageQuestion ? `${questionId}.png` : null;

        if (isImageQuestion) {
          const imageUrl = $(element).parent().find('img').attr('src');
          return downloadImage(imageUrl, path.join(imagesFolderPath, imagePath))
            .then(() => {
              const options = $(element).nextUntil('p', 'ul li');
              const mchoice = options.map((i, option) => {
                const answerId = generateRandomId();
                const answer = $(option).text().replace(/\s+/g, ' ').trim();
                const correct = $(option).find('span[style="color: #ff0000;"] strong').length > 0 ? 1 : 0;

                return {
                  answerId: answerId,
                  answerNbr: i,
                  answer: answer,
                  correct: correct
                };
              }).get();

              const explanationElement = $(element).parent().nextUntil('p', 'div.message_box.success p');
              const explanation = explanationElement.length > 0 ? explanationElement.text().replace(/\s+/g, ' ').trim() : '';

              questions.push({
                questionId: questionId,
                question: questionText.replace(/^\d+\./, '').trim(),
                image: isImageQuestion,
                imagePath: imagePath,
                mchoice: mchoice,
                course: course,
                section: section,
                explanation: explanation
              });
            });
        }

        const options = $(element).nextUntil('p', 'ul li');
        const mchoice = options.map((i, option) => {
          const answerId = generateRandomId();
          const answer = $(option).text().replace(/\s+/g, ' ').trim();
          const correct = $(option).find('span[style="color: #ff0000;"] strong').length > 0 ? 1 : 0;

          return {
            answerId: answerId,
            answerNbr: i,
            answer: answer,
            correct: correct
          };
        }).get();

        const explanationElement = $(element).parent().nextUntil('p', 'div.message_box.success p');
        const explanation = explanationElement.length > 0 ? explanationElement.text().replace(/\s+/g, ' ').trim() : '';

        questions.push({
          questionId: questionId,
          question: questionText.replace(/^\d+\./, '').trim(),
          image: isImageQuestion,
          imagePath: imagePath,
          mchoice: mchoice,
          course: course,
          section: section,
          explanation: explanation
        });
      }
    });

    return Promise.all(questions);
  }).catch(error => {
    console.error('Fehler beim Extrahieren der Daten:', error.message);
    return null;
  });
}

function processLinks() {
  const links = readLinks();

  const promises = links.map(link => {
    return extractData(link.url, link.course, link.section).then(data => {
      if (data) {
        // Entfernen Sie Leerzeichen und Tabulatoren aus dem Dateinamen
        const fileName = `${link.course}-${link.section.replace(/[\s\t]/g, '')}`;
        const filePath = path.join(jsonsFolderPath, `${fileName}.json`);

        // Speichern Sie das Ergebnis in einer JSON-Datei
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

        console.log(`Daten für ${link.course} - ${link.section} wurden in ${filePath} gespeichert.`);

        // Download images if they exist
        return Promise.all(data.map(question => {
          if (question.image) {
            // Entfernen Sie den imagePath aus der JSON
            delete question.imagePath;

            return downloadImage(question.imagePath, path.join(imagesFolderPath, `${fileName}.png`));
          }
        }));
      }
    });
  });

  return Promise.all(promises);
}


function main() {
  // Überprüfen Sie, ob der jsons-Ordner existiert, und erstellen Sie ihn, wenn nicht.
  if (!fs.existsSync(jsonsFolderPath)) {
    fs.mkdirSync(jsonsFolderPath);
  }

  // Überprüfen Sie, ob der Images-Ordner existiert, und erstellen Sie ihn, wenn nicht.
  if (!fs.existsSync(imagesFolderPath)) {
    fs.mkdirSync(imagesFolderPath);
  }

  return processLinks();
}

main();
