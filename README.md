# DrawAFish.com

DrawAFish.com is a playful browser-based drawing app that lets users doodle a fish, have it automatically classified by an AI model, and make it swim in a shared online tank! The app provides instant feedback using a neural network, and only valid fish can join the tank.

## Features
- Draw a fish (facing right) on the canvas.
- AI-powered fish classifier (ONNX model, originally trained in PyTorch) checks your doodle after every stroke.
- Immediate feedback: background color and probability indicator.
- Only valid fish can be submitted.
- Sign your art before submitting (default: Anonymous).
- Download your drawing or submit it to the tank.
- See your fish swim with others in a lively, interactive tank.

## How it Works
- The app runs entirely in the browser, using ONNX Runtime Web for client-side inference.
- Preprocessing in JavaScript matches the PyTorch training pipeline (crop, resize, grayscale, normalization, etc.).
- When you submit a fish, the image and metadata are sent to the backend, which stores and returns the processed fish image for display in the tank.

## Project Structure
- `index.html` — Main HTML page and UI.
- `app.js` — All drawing, AI, and UI logic.
- `style.css` — Styles for the app.
- `firebase-init.js` — Firebase/Firestore initialization (for legacy and/or real-time features).

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
2. Place your ONNX model (`fish_doodle_classifier.onnx`) in the public directory.
3. Configure `firebase-init.js` if using Firestore for real-time features.
4. Deploy the static site (e.g., Vercel, Netlify, Firebase Hosting).
5. Ensure the backend endpoint in `app.js` points to your deployed `fish-be` instance.

## Credits
- AI model and training: [fish-trainer](https://github.com/aldenhallak/fish-trainer)
- Backend: [fish-be](https://github.com/aldenhallak/fish-be)
- Frontend & UI: This repository

---
This repository was vibe coded that's why the app.js is so messed up. I don't like frontend work and I let the AI do it for me... I'll do a refactor down the line.
