const express = require('express');
const multer = require('multer');
const fs = require('fs');

const port = 8000;

const app = express();
const upload = multer({ dest: 'upload/' });
const notesFilePath = 'notes.json';
app.use(express.json());

if (!fs.existsSync(notesFilePath)) {
    fs.writeFileSync(notesFilePath, '[]', 'utf-8');
}

app.get('/', (req, res) => {
    res.send('Сервер запущений');
});

app.get('/notes', (req, res) => {
    if (fs.existsSync(notesFilePath)) {
      const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
      res.json(notes);
    } else {
      res.json([]);
    }
  });

app.get('/UploadForm.html', (req, res) => {
    res.sendFile(__dirname + '/static/UploadForm.html');
});
    
app.post('/upload', upload.none(), (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;

    let notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));

    if (notes.some((note) => note.note_name === noteName)) {
        res.status(400).send('400: Нотатка з таким іменем уже існує');
    } else {
        const newNote = { note_name: noteName, note_text: noteText };
        notes.push(newNote);

        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
        res.status(201).send('201: Нотатка створена успішно');
    }
});

app.get("/notes/:noteName", (req, res) => {
    const noteName = req.params.noteName;
    const filePath = path.join(__dirname, "notes.json");
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).send('404: Нотатки не існує');
      } else {
        const notesData = fs.readFileSync(filePath, "utf8");
        const notes = JSON.parse(notesData);
        const foundNote = notes.find((note) => note.note_name === noteName);
        if (foundNote) {
          const textFromNote = foundNote.note_text.toString();
          res.status(200).send(textFromNote);
        } else {
          // Якщо нотатка з вказаним ім'ям не знайдена, вивести помилку 404
          res.status(404).send('404: Нотатки з таким іменем не існує');
        }
      }
    });
  });

app.put('/notes/:noteName', express.text(), (req, res) => {
    const noteName = req.params.noteName;
    const updatedNoteText = req.body;

    const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
    const noteToUpdate = notes.find((data) => data.note_name === noteName);

    if (noteToUpdate) {
        noteToUpdate.note_text = updatedNoteText; 
        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
        res.status(200).send('200: Нотатку оновлено успішно');
    } else {
        res.status(404).send('404: Нотатка з таким іменем не існує');
    }
});

app.delete('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;

    let notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
    const noteIndex = notes.findIndex((data) => data.note_name === noteName);

    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
        res.status(200).send('200: Нотатку видалено успішно');
    } else {
        res.status(404).send('404: Нотатка з таким іменем не існує');
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
