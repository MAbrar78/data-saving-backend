const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  description: String,
  link: String,
  image: String,
  audio: String,
  video: String,
  document: String,
  generalFile: String, // Added this field for various types of files
  imageName: String,   // Added field for image file name
  audioName: String,   // Added field for audio file name
  videoName: String,   // Added field for video file name
  documentName: String, // Added field for document file name
  generalFileName: String, // Added field for general file name
}, { timestamps: true });

module.exports = mongoose.model('Data', DataSchema);
