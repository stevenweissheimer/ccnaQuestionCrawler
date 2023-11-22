const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const linksFilePath = 'links.json';

// Überprüfe, ob die Datei existiert, und erstelle sie sonst
if (!fs.existsSync(linksFilePath)) {
  fs.writeFileSync(linksFilePath, '{"links": []}', 'utf-8');
}

function readLinks() {
  const linksData = JSON.parse(fs.readFileSync(linksFilePath, 'utf-8'));
  return linksData.links;
}

function writeLinks(links) {
  const linksData = { links };
  fs.writeFileSync(linksFilePath, JSON.stringify(linksData), 'utf-8');
}

app.get('/', (req, res) => {
  const links = readLinks();
  res.render('index', { links });
});

app.post('/add', (req, res) => {
  const newUrl = req.body.newUrl;
  const newCourse = req.body.newCourse;
  const newSection = req.body.newSection;
  const newCrawlMode = req.body.newCrawlMode;

  const links = readLinks();

  // Füge den neuen Link zur Liste hinzu
  links.push({ url: newUrl, course: newCourse, section: newSection, crawlMode: newCrawlMode });

  // Speichere die aktualisierten Daten
  writeLinks(links);

  // Lade die aktualisierte Ansicht
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  const linkToDelete = req.body.link;

  let links = readLinks();

  // Filtere den Link aus der Liste
  links = links.filter(link => link.url !== linkToDelete);

  // Speichere die aktualisierten Daten
  writeLinks(links);

  // Lade die aktualisierte Ansicht
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
