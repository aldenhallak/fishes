# ✅ Configuration Checklist

**Complete this checklist before deploying your site.**

---

## 📝 Information You Need to Provide

### 1. Twitter Account ✏️

```
Your Twitter handle: @________________
Your Twitter URL: https://twitter.com/________________
```

**Don't have Twitter yet?**
- Go to [twitter.com](https://twitter.com)
- Sign up (2 minutes)
- Choose a handle related to your niche (e.g., @AIToolsDaily, @CreativeAIHub)

---

### 2. Discord Server ✏️

```
Your Discord invite link: https://discord.gg/________________
```

**Don't have a Discord server yet?**

1. Open Discord
2. Click "+" button (Add a Server)
3. Choose "Create My Own"
4. Name it (e.g., "AI Tools Community")
5. Right-click server name → "Invite People"
6. Click "Edit invite link"
7. Set "Expire after" → "Never"
8. Set "Max uses" → "No limit"
9. Copy the link
10. Done! (5 minutes total)

**Recommended channels:**
```
📢 announcements
💬 general
🎨 showcase
💡 suggestions
🐛 bug-reports
```

---

### 3. Domain Name (Optional) ✏️

```
Your custom domain: ________________.com
```

**Options:**
- [ ] Use free Vercel subdomain (e.g., `ai-fish-drawing.vercel.app`)
- [ ] Use custom domain (costs $10-15/year)

**If using custom domain:**
- Buy from: Namecheap, Google Domains, Cloudflare
- You'll configure it in Vercel after deployment

---

## 🔧 Files to Edit

### File 1: `src/js/social-config.js`

**Lines to change:**

```javascript
// Line 11 - Replace with YOUR Twitter handle (without @)
handle: "YourActualHandle",

// Line 12 - Replace with YOUR Twitter URL
url: "https://twitter.com/YourActualHandle",

// Line 16 - Replace with YOUR Discord invite link
inviteUrl: "https://discord.gg/your-actual-code",
```

**How to edit:**
1. Open `fishes/src/js/social-config.js`
2. Find the three lines above
3. Replace the placeholder text
4. Save the file

---

### File 2: `index.html`

**Lines to change:**

```html
<!-- Line 25 -->
<meta name="twitter:site" content="@YourActualHandle">

<!-- Line 26 -->
<meta name="twitter:creator" content="@YourActualHandle">
```

**How to edit:**
1. Open `fishes/index.html`
2. Search for `@YourTwitterHandle`
3. Replace both instances
4. Save the file

---

## ✅ Pre-Deployment Checklist

### Configuration Complete

- [ ] Created Twitter account
- [ ] Created Discord server  
- [ ] Got Discord invite link (never expires)
- [ ] Edited `social-config.js`
- [ ] Edited `index.html` meta tags
- [ ] Saved all files

### Local Testing

- [ ] Tested site locally (`python -m http.server 8000`)
- [ ] Drawing works
- [ ] AI validation works
- [ ] Submission works
- [ ] Twitter link goes to YOUR Twitter
- [ ] Discord link goes to YOUR Discord
- [ ] Share buttons open correctly

### Git Ready

- [ ] All files committed
  ```bash
  git add .
  git commit -m "Configured social links"
  ```
- [ ] Pushed to GitHub
  ```bash
  git push origin main
  ```

---

## 🚀 Deployment Checklist

### Vercel Setup

- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Clicked "Deploy"
- [ ] Deployment successful
- [ ] Noted deployment URL: `https://________________.vercel.app`

### Post-Deployment Testing

- [ ] Opened live site
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Clicked Twitter link (goes to YOUR Twitter)
- [ ] Clicked Discord link (goes to YOUR Discord)
- [ ] Submitted a test fish
- [ ] Success modal appeared
- [ ] Share buttons worked

### Custom Domain (If applicable)

- [ ] Added domain in Vercel settings
- [ ] Updated DNS records
- [ ] Waited for DNS propagation (5-60 minutes)
- [ ] Site accessible via custom domain

---

## 📱 Launch Checklist

### Social Media Preparation

- [ ] Prepared launch tweet
- [ ] Prepared Discord announcement
- [ ] Created demo GIF/video (optional but recommended)
- [ ] Made preview image for social sharing

### Launch Content Templates

**Twitter Launch Tweet:**
```
Just launched [Your Project Name]! 🐟

✨ Draw a fish with AI validation
🎨 Watch it swim in the tank
🌍 Join our community

Try it free: [your-url]

#AI #CreativeTools #BuildInPublic
```

**Discord Announcement:**
```
🎉 Welcome to [Your Project Name]!

This is a community for creators who love AI tools.

🐟 Try the AI fish drawing tool: [your-url]
💬 Introduce yourself in #general
🎨 Share your creations in #showcase

Let's build something amazing together!
```

### Launch Day

- [ ] **Hour 0:** Site goes live
- [ ] **Hour 1:** Tweet announcement
- [ ] **Hour 1:** Discord announcement
- [ ] **Hour 2:** Submit to Product Hunt
- [ ] **Hour 3:** Post on Reddit (r/InternetIsBeautiful, r/SideProject)
- [ ] **Hour 4:** Post on LinkedIn
- [ ] **Day 1:** Reply to all comments/messages
- [ ] **Day 1:** Fix any bugs reported

---

## 🎯 Post-Launch Checklist

### First Week

- [ ] **Daily:** Check Twitter mentions
- [ ] **Daily:** Check Discord messages
- [ ] **Daily:** Monitor analytics
- [ ] **3x/week:** Post updates on Twitter
- [ ] **2x/week:** Engage in Discord
- [ ] **1x/week:** Share user creations

### Growth Activities

- [ ] Created 3-5 short videos (TikTok/YouTube)
- [ ] Responded to Product Hunt comments
- [ ] Engaged with similar creators on Twitter
- [ ] Started weekly challenge in Discord
- [ ] Cross-promoted in relevant communities

---

## 📊 Analytics Setup (Optional)

### Google Analytics

- [ ] Created GA4 property
- [ ] Replaced GA ID in `index.html` (line 35)
  ```javascript
  gtag('config', 'YOUR-GA-ID-HERE');
  ```

### Vercel Analytics

- [ ] Enabled in Vercel dashboard (free)
- [ ] Reviewing traffic data

### Social Analytics

- [ ] Monitoring Twitter Analytics
- [ ] Checking Discord Insights
- [ ] Tracking referral sources

---

## 🔍 Troubleshooting

### Common Issues

**Problem:** "Links still say placeholder"
- [ ] Did you edit `social-config.js`?
- [ ] Did you save the file?
- [ ] Did you commit and push changes?

**Problem:** "Site works locally but not on Vercel"
- [ ] All files committed to git?
- [ ] Pushed to correct branch?
- [ ] Checked Vercel deployment logs?

**Problem:** "Twitter card doesn't show image"
- [ ] Updated meta tags in `index.html`?
- [ ] Image URL publicly accessible?
- [ ] Tested with [Twitter Card Validator](https://cards-dev.twitter.com/validator)?

**Problem:** "Discord link doesn't work"
- [ ] Invite link set to never expire?
- [ ] Invite link has no usage limit?
- [ ] Server still exists?

---

## 📞 Getting Help

### Resources

1. **Deployment Guide:** See `DEPLOYMENT.md`
2. **Setup Guide:** See `SETUP_GUIDE.md`
3. **Project Summary:** See `PROJECT_SUMMARY.md`

### Support Channels

- **Technical issues:** Check browser console (F12)
- **Original project:** [GitHub Issues](https://github.com/aldenhallak/fishes/issues)
- **Vercel issues:** [Vercel Support](https://vercel.com/support)

---

## ✅ Completion Status

### My Progress

```
Configuration: [ ] Not Started  [ ] In Progress  [ ] Complete
Local Testing: [ ] Not Started  [ ] In Progress  [ ] Complete
Deployment:    [ ] Not Started  [ ] In Progress  [ ] Complete
Launch:        [ ] Not Started  [ ] In Progress  [ ] Complete
```

### Next Steps

After completing all checklists:

1. ✅ Your site is live
2. ✅ Social links configured
3. ✅ Ready to attract users
4. 🚀 **Start promoting!**

---

## 🎉 You're Ready!

Once all checklists are complete, you're ready to launch!

**Estimated time:** 30 minutes - 2 hours (depending on experience)

**Good luck with your launch!** 🚀

---

**Questions?** Create an issue or check the documentation files.

