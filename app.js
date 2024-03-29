const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const { SpeechClient } = require("@google-cloud/speech");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
import React from "react";
import ReactDOM from "react-dom";
import App from ".client/build/App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

//Use .env file in config folder
require("dotenv").config({ path: "config/.env" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Configure Google Cloud Speech
const speechClient = new SpeechClient();

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost/video_recording_app', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
//Connect to the database
// mongoose.connect(process.env.DB_STRING,
//     {useNewUrlParser: true},
//     {useUnifiedTopology: true},
//     () => (console.log(`Connected to database: ${mongoose.connection.name}`))
// )
//Connect To Database
connectDB();

const app = express();
app.set("view engine", "ejs");

// Set up middleware
//app.use(express.static('public'));
// Set up static file serving for the public folder
app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

//setup react app
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client", "build")));

// Handle other API routes and endpoints here

// Serve the React app for any other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Define routes for ejs render
// app.get("/", (req, res) => {
//   res.render("index");
// });

// file upload route (/upload) to handle the video upload and save it to the chosen cloud storage provider (S3 or Google Cloud Storage).
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  const path = req.file.path;

  // Upload the video to Cloudinary
  cloudinary.uploader.upload(
    path,
    { resource_type: "video" },
    (error, result) => {
      if (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ error: "Error uploading video" });
      }

      res.json(result);
    }
  );
});

// video processing route (/process) to perform video editing and AI analysis using the Cloudinary API and other AI services

app.post("/transcribe", (req, res) => {
  const publicId = req.body.publicId;

  // Get the video URL from Cloudinary
  const videoUrl = cloudinary.url(publicId, { resource_type: "video" });

  // Transcribe the video using the Google Cloud Speech-to-Text API
  speechClient
    .longRunningRecognize({
      audio: { uri: videoUrl },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    })
    .then((data) => {
      const operation = data[0];
      return operation.promise();
    })
    .then((data) => {
      const transcription = data[0].results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      res.json({ transcription });
    })
    .catch((error) => {
      console.error("Error transcribing video:", error);
      res.status(500).json({ error: "Error transcribing video" });
    });
});

// video processing route (/process) to perform video editing and AI analysis using the Cloudinary API and other AI services.

app.post("/process", (req, res) => {
  const publicId = req.body.publicId;

  // Perform video editing using Cloudinary
  // Example: Trim the video to the first 10 seconds
  const videoUrl = cloudinary.url(publicId, { resource_type: "video" });
  const editedVideoUrl = cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [{ duration: 10 }],
  });

  // Perform AI analysis using other APIs
  // Example: Call the face recognition API
  // const faces = detectFaces(editedVideoUrl);

  res.json({ editedVideoUrl });
});

// Start the server
// app.listen(3000, () => {
//   console.log('Server started on port 3000');
// });
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
