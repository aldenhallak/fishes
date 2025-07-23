# DrawAFish.com - Interactive Fish Drawing

🐟 **[DrawAFish.com](https://drawafish.com)** 🐟

Users have their fish drawings AI-validated in real time and watch their creations swim in a shared tank. 

[![Fish Drawing](https://img.shields.io/badge/Game-Live-brightgreen)](https://drawafish.com)
[![AI Powered](https://img.shields.io/badge/AI-ONNX-blue)](https://onnx.ai/)
[![Community](https://img.shields.io/badge/Community-Voting-orange)](#features)

## 🎮 Features

### 🎨 **Interactive Drawing**
- **Real-time AI validation** - Draw fish and get instant feedback from our neural network.
- **Smart canvas** - Intuitive drawing tools with pressure-sensitive input
- **Live classification** - Background color changes as the AI recognizes your fish
- **Drawing hints** - Visual cues help you create better fish drawings

### 🏊 **Community Fish Tank**
- **Shared aquarium** - Watch your fish swim with creations from artists worldwide
- **Multiple view modes** - See most recent, popular, or random fish
- **Smooth animations** - Fish move naturally through the virtual water
- **Interactive experience** - Click fish to learn about their creators

### 🗳️ **Voting & Rankings**
- **Community voting** - Rate fish drawings from other artists
- **Smart ranking system** - Algorithm balances recency and popularity
- **Artist profiles** - Track your stats and see your fish collection
- **Leaderboards** - Discover the most loved fish in the community

### 🗂️ **Personal Collections**
- **Custom fish tanks** - Create themed collections of your favorite fish
- **Share collections** - Let friends explore your curated tanks
- **Privacy controls** - Make tanks public or keep them private
- **Organize by theme** - Group fish by color, style, or any criteria

## 🧠 How the AI Works

The app uses machine learning for real-time fish recognition:

- **ONNX Runtime Web** - Runs neural network inference entirely in your browser
- **PyTorch-trained model** - Originally developed and trained using PyTorch
- **Instant feedback** - Classification happens with every brush stroke
- **Quality control** - Only validated fish can join the community tank

## 🚀 Getting Started

1. **Visit [DrawAFish.com](https://drawafish.com)**
2. **Start drawing** on the canvas (fish should face right!)
3. **Watch the AI** give feedback through background color changes
4. **Submit your fish** when you're happy with it
5. **See it swim** in the community tank with other creations
6. **Vote and explore** other artists' fish in the rankings

## 📱 Cross-Platform Compatible

- **Desktop browsers** - Full experience with mouse/trackpad drawing
- **Tablet friendly** - Touch-optimized for iPad and Android tablets  
- **Mobile responsive** - Works on phones with simplified interface
- **Progressive Web App** - Can be installed like a native app

## 🌟 Community Features

### For Artists
- **Profile system** - Track your fish creations and statistics
- **Personal galleries** - Showcase your best work
- **Achievement tracking** - See your voting scores and community engagement
- **Social sharing** - Share your fish and tanks on social media

### For Viewers  
- **Discovery tools** - Find new artists and trending fish
- **Voting system** - Help surface the best community content
- **Collections** - Save favorites to personal fish tanks
- **Commenting** - Engage with the community (coming soon)

## 🔧 Technical Details

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
