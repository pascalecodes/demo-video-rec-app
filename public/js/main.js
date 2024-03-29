const recordButton = document.getElementById('recordButton');
let mediaRecorder;
let recordedBlobs = [];

recordButton.addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    // Start recording
    recordedBlobs = [];
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      // Create a blob from the recorded data
      const blob = new Blob(recordedBlobs, { type: 'video/webm' });

      // Upload the blob to Cloudinary using the Cloudinary API
      const formData = new FormData();
      formData.append('file', blob);

      fetch('/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log('Video uploaded:', data);
          // Handle the response as needed

          // Perform transcription
          // fetch('/transcribe', {
          //   method: 'POST',
          //   body: JSON.stringify({ publicId: data.public_id }),
          //   headers: { 'Content-Type': 'application/json' }
          // })
          //   .then(response => response.json())
          //   .then(transcription => {
          //     console.log('Transcription:', transcription);
          //     // Handle the transcription as needed
          //   })
          //   .catch(error => {
          //     console.error('Error transcribing video:', error);
          //     // Handle the error as needed
          //   });

          // // Perform video editing and AI analysis
          // fetch('/process', {
          //   method: 'POST',
          //   body: JSON.stringify({ publicId: data.public_id }),
          //   headers: { 'Content-Type': 'application/json' }
          // })
          //   .then(response => response.json())
          //   .then(results => {
          //     console.log('Processing results:', results);
          //     // Handle the processing results as needed
          //   })
          //   .catch(error => {
          //     consoletposeError('Error processing video:', error);
          //     // Handle the error as needed
          //   });
        })
        .catch(error => {
          console.error('Error uploading video:', error);
          // Handle the error as needed
        });
    });

    mediaRecorder.start();
    recordButton.textContent = 'Stop Recording';
  } else {
    // Stop recording
    mediaRecorder.stop();
    recordButton.textContent = 'Start Recording';
  }
});

function displayPrompt(prompt) {
  const promptElement = document.getElementById('prompt');
  promptElement.textContent = prompt;
}

function shareRecording(recordingUrl) {
  // Open social media sharing options or generate shareable link
}

function displayRecordings(recordings) {
  // Populate an element with information about each recording (title, date, thumbnail)
}

function trimRecording(recordingUrl, startTime, endTime) {
  // Call backend function to perform trimming on the stored recording
}

function filterStoriesByTag(tag) {
  // Retrieve stories with the specified tag from the database
}

