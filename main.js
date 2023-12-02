const electron = require("electron");
const express = require('express');
const multer = require('multer');
const ex = express();
const { app, BrowserWindow, ipcMain } = electron;
const path = require('node:path');
const {processCsvFile} = require("./processCsvFile");
// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, "customers_epos.csv");
    }
});

const upload = multer({ storage: storage });

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile("index.html");
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('toMain', (event, data) => {
  console.log(data); // 'some data'
  event.reply('fromMain', 'pong');
});

ex.post('/upload', upload.single('csvfile'), (req, res) => {
    console.log('Received file', req.file.originalname);
    // Call your CSV processing function here
    // For example: processCSV(req.file.path);
    processCsvFile()
    .then(() => {
      res.json({ message: 'success' });
     })
    .catch(error => {
      console.error("Error processing the file:", error);
      res.status(500).json({ message: 'Error processing the file.' });
     });
  
    // res.json({ message: 'File uploaded successfully.' });
});

ex.listen(3000, () => {
    console.log('Server is running on port 3000');
});


