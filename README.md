# DrawAFish.com

DrawAFish.com is a playful browser-based drawing app that lets users doodle a fish, have it automatically classified by an AI model, and make it swim in a shared online tank! The app provides instant feedback using a neural network, and only valid fish can join the tank.

## Features
- Draw a fish (facing right) on the canvas.
- AI-powered fish classifier (ONNX model, originally trained in PyTorch) checks your doodle after every stroke.
- Immediate feedback: background color and probability indicator.
- Only valid fish can be submitted.
- Sign the art before submitting (default: Anonymous).
- See your fish swim with others in a lively, interactive tank.

## How it Works
- The app runs entirely in the browser, using ONNX Runtime Web for client-side inference.
- Preprocessing in JavaScript matches the PyTorch training pipeline (crop, resize, grayscale, normalization, etc.).
- When you submit a fish, the image and metadata are sent to the backend, which stores and returns the processed fish image for display in the tank.

## Project Structure

### HTML Pages (Root Directory)
- `index.html` — Main drawing page and UI
- `tank.html` — Fish tank display with swimming animations
- `rank.html` — Fish ranking and voting system
- `login.html` — Authentication page for moderation
- `moderation.html` — Moderation interface for managing submissions

### Source Files
- `src/js/` — JavaScript files
  - `app.js` — Main drawing, AI, and UI logic
  - `tank.js` — Fish tank animation and display
  - `rank.js` — Ranking system logic
  - `login.js` — Authentication handling
  - `moderation.js` — Moderation tools
  - `fish-utils.js` — Shared utilities and API calls
  - `firebase-init.js` — Firebase/Firestore initialization
- `src/css/` — Stylesheets
  - `style.css` — Main application styles
  - `moderation.css` — Moderation-specific styles

### Assets
- `assets/` — Static assets (images, models)
- `public/` — Public assets (favicon, etc.)

## Connected Repositories

### [fish-trainer](https://github.com/aldenhallak/fish-trainer)
- Contains the PyTorch code for training the fish doodle classifier.
- Exports the trained model to ONNX format, which is used by DrawAFish.com for in-browser inference.
- Includes data augmentation, preprocessing, and model evaluation scripts.

### [fish-be](https://github.com/aldenhallak/fish-be)
- The backend for DrawAFish.com, deployed as a serverless function (I'm using cloud run :~)).
- Handles fish image uploads, processes and stores submissions, and returns the canonical fish image for the tank.
- May also provide endpoints for moderation, stats, or gallery features.

## Setup & Deployment
1. Clone this repository.
2. Place the ONNX model (`fish_doodle_classifier.onnx`) in the `assets/models/` directory.
3. Configure `src/js/firebase-init.js` if using Firestore for real-time features.
4. Deploy the static site (e.g., Vercel, Netlify, Firebase Hosting).
5. Ensure the backend endpoint in `src/js/fish-utils.js` points to the deployed `fish-be` instance.

## Credits
- AI model and training: [fish-trainer](https://github.com/aldenhallak/fish-trainer)
- Backend: [fish-be](https://github.com/aldenhallak/fish-be)
- Frontend & UI: This repository

---

This repository was about ~80% AI generated. I used copilot + zencoder. Both tools worked great, but could not be trusted to make decisions on their own :)
