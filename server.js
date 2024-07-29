const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/DataSaving', {
  useNewUrlParser: true, // Deprecated option, can be removed
  useUnifiedTopology: true, // Deprecated option, can be removed
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for your data
const DataSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  description: String,
  link: String,
  image: String,
  audio: String,
  video: String,
  document: String,
  documentName: String, // Added this field
  generalFile: String, // Added this field
}, { timestamps: true });

const Data = mongoose.model('Data', DataSchema);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Routes
app.post('/data', upload.fields([{ name: 'image' }, { name: 'audio' }, { name: 'video' }, { name: 'document' }, { name: 'generalFile' }]), async (req, res) => {
  try {
    const newData = new Data({
      username: req.body.username,
      password: req.body.password,
      description: req.body.description,
      image: req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : '',
      imageName: req.files['image'] ? req.files['image'][0].originalname : '',
      audio: req.files['audio'] ? `/uploads/${req.files['audio'][0].filename}` : '',
      audioName: req.files['audio'] ? req.files['audio'][0].originalname : '',
      video: req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : '',
      videoName: req.files['video'] ? req.files['video'][0].originalname : '',
      document: req.files['document'] ? `/uploads/${req.files['document'][0].filename}` : '',
      documentName: req.files['document'] ? req.files['document'][0].originalname : '',
      generalFile: req.files['generalFile'] ? `/uploads/${req.files['generalFile'][0].filename}` : '',
      generalFileName: req.files['generalFile'] ? req.files['generalFile'][0].originalname : '',
      link: req.body.link,
    });

    await newData.save();
    res.status(200).json({ message: 'Data saved successfully!', data: newData });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error saving data', error: error.message });
  }
});

app.put('/data/:id', upload.fields([{ name: 'image' }, { name: 'audio' }, { name: 'video' }, { name: 'document' }, { name: 'generalFile' }]), async (req, res) => {
  try {
    const id = req.params.id;
    const existingData = await Data.findById(id);

    if (!existingData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const updateData = {
      username: req.body.username || existingData.username,
      password: req.body.password || existingData.password,
      description: req.body.description || existingData.description,
      image: req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : existingData.image,
      imageName: req.files['image'] ? req.files['image'][0].originalname : existingData.imageName,
      audio: req.files['audio'] ? `/uploads/${req.files['audio'][0].filename}` : existingData.audio,
      audioName: req.files['audio'] ? req.files['audio'][0].originalname : existingData.audioName,
      video: req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : existingData.video,
      videoName: req.files['video'] ? req.files['video'][0].originalname : existingData.videoName,
      document: req.files['document'] ? `/uploads/${req.files['document'][0].filename}` : existingData.document,
      documentName: req.files['document'] ? req.files['document'][0].originalname : existingData.documentName,
      generalFile: req.files['generalFile'] ? `/uploads/${req.files['generalFile'][0].filename}` : existingData.generalFile,
      generalFileName: req.files['generalFile'] ? req.files['generalFile'][0].originalname : existingData.generalFileName,
      link: req.body.link || existingData.link,
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const data = await Data.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: 'Data updated successfully!', data });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.delete('/data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Data.findById(id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // List of file paths to delete
    const filePaths = [
      data.image,
      data.audio,
      data.video,
      data.document,
      data.generalFile
    ];

    // Delete files from the uploads folder
    filePaths.forEach(filePath => {
      if (filePath) {
        const filePathToDelete = path.join(__dirname, 'uploads', path.basename(filePath));
        fs.unlink(filePathToDelete, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${filePathToDelete}`, err);
          } else {
            console.log(`Successfully deleted file: ${filePathToDelete}`);
          }
        });
      }
    });

    // Delete the document from the database
    await Data.findByIdAndDelete(id);
    res.status(200).json({ message: 'Data deleted successfully!' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

app.get('/data', async (req, res) => {
  try {
    const data = await Data.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
