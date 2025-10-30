# ⚡ Quick Setup Guide

Get your AI Fish Drawing site live in **3 steps** (15 minutes).

---

## Step 1: Configure Your Social Links (5 min)

### Edit `src/js/social-config.js`

Find and replace these values:

```javascript
// Line 11-13: YOUR TWITTER
twitter: {
  handle: "YourTwitterHandle", // ← Change this
  url: "https://twitter.com/YourTwitterHandle", // ← Change this
  ...
},

// Line 16-18: YOUR DISCORD  
discord: {
  inviteUrl: "https://discord.gg/placeholder", // ← Change this
  ...
},
```

### Edit `index.html`

Find lines 25-26 and update:

```html
<meta name="twitter:site" content="@YourTwitterHandle"> <!-- Change this -->
<meta name="twitter:creator" content="@YourTwitterHandle"> <!-- Change this -->
```

**That's it for configuration!** ✅

---

## Step 2: Test Locally (5 min)

### Option A: Simple HTTP Server

```bash
# Using Python
cd fishes
python -m http.server 8000

# Or using Node.js
npx serve
```

Then open: `http://localhost:8000`

### Option B: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### What to Test:

- [ ] Can draw fish
- [ ] AI validation works
- [ ] Can submit fish
- [ ] Twitter link goes to YOUR Twitter
- [ ] Discord link goes to YOUR Discord
- [ ] Share buttons open properly

---

## Step 3: Deploy to Vercel (5 min)

### Method 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configured social links"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Done!** 🎉
   - Your site is live at `https://your-project.vercel.app`
   - Every push to `main` auto-deploys

### Method 2: Vercel CLI (For developers)

```bash
npm i -g vercel
cd fishes
vercel
```

Follow prompts → Done!

---

## Optional: Add Custom Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `myfish.com`)
4. Update DNS records as shown
5. Wait 5-60 minutes for DNS propagation

---

## 🚀 Post-Launch Checklist

After deployment:

- [ ] Test live site on mobile
- [ ] Test live site on desktop  
- [ ] Verify Twitter link works
- [ ] Verify Discord link works
- [ ] Try submitting a fish
- [ ] Share on Twitter
- [ ] Share in Discord
- [ ] Submit to Product Hunt (optional)

---

## 🎯 Example Social Media Posts

### Twitter Launch Post

```
Just launched an AI fish drawing tool! 🐟

✨ Draw in your browser
🤖 AI validates in real-time  
🌊 Watch it swim in the tank

Free & open-source

Try it: [your-url]

#AI #CreativeTools #BuildInPublic
```

### Discord Announcement

```
🎉 **New Project Launch**

I just launched an AI-powered fish drawing tool!

🐟 Draw a fish
🤖 AI validates it
🌊 Watch it swim with others

Check it out: [your-url]

What fish will you create?
```

---

## ❓ Quick Troubleshooting

**Q: Links still say "placeholder"?**  
A: Did you edit `social-config.js` and save the file?

**Q: Site works locally but not on Vercel?**  
A: Make sure you committed all files (`git add .` then `git commit -m "fix"` then `git push`)

**Q: How do I update links after deployment?**  
A: Edit `social-config.js`, commit, and push. Vercel auto-deploys.

**Q: Can I use my own backend?**  
A: Yes! Edit `src/js/fish-utils.js` line 33 to point to your backend URL.

---

## 📚 Full Documentation

- **Deployment Details**: See `DEPLOYMENT.md`
- **Original Project**: [github.com/aldenhallak/fishes](https://github.com/aldenhallak/fishes)

---

## ✅ You're Done!

Your AI Fish Drawing site is ready to attract users.

**Next steps:**
1. Share on social media
2. Engage with your first users
3. Collect feedback
4. Iterate and improve

Good luck! 🚀

