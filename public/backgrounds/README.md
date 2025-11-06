# Fish Tank Background Images

This directory contains background images for the private fish tank feature.

## Required Files

Place the following background images in this directory:

- `bg-1.jpg` - Ocean Blue (Default, Free)
- `bg-2.jpg` - Deep Sea (3 fish food)
- `bg-3.jpg` - Coral Reef (3 fish food)
- `bg-4.jpg` - Sunset Ocean (5 fish food)
- `bg-5.jpg` - Glacier Waters (5 fish food)

## Image Specifications

- **Aspect Ratio**: 16:9 (recommended)
- **Dimensions**: At least 1920x1080px (Full HD recommended)
- **Format**: JPG or PNG
- **File Size**: Keep under 500KB for faster loading
- **Style**: Should be suitable as underwater/aquatic backgrounds

## Where to Get Images

### Free Stock Photo Sites:
1. **Unsplash** (https://unsplash.com)
   - Search for: "ocean", "underwater", "sea", "coral reef", "deep sea"
   - License: Free for commercial use
   
2. **Pexels** (https://www.pexels.com)
   - Search for similar aquatic themes
   - License: Free for commercial use

3. **Pixabay** (https://pixabay.com)
   - Ocean and underwater imagery
   - License: Free for commercial use

### Suggested Search Terms:
- "ocean blue water"
- "deep sea dark"
- "coral reef colorful"
- "sunset ocean golden"
- "arctic glacier water"
- "underwater blue background"

## Temporary Placeholders

Currently using SVG placeholders. Replace with actual images for production.

## Image Processing Tips

```bash
# Resize to 1920x1080 using ImageMagick
convert input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 output.jpg

# Compress JPG
convert input.jpg -quality 80 output.jpg

# Or use online tools:
# - TinyPNG (https://tinypng.com) for compression
# - Canva (https://canva.com) for resizing
```

## Testing

After adding images, verify them in the private tank page:
1. Log in to your account
2. Go to "My Fish Tank"
3. Click on background selector
4. Test each background option

## Notes

- The first background (bg-1.jpg) is free and used as the default
- Other backgrounds cost fish food tokens to unlock
- Images should be optimized for web to reduce page load times











