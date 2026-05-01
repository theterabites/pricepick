#!/bin/bash
# Generates feature-graphic.png (1024x500) for Play Store listing

OUT="$(dirname "$0")/../assets/images"

magick -size 1024x500 xc:"#3A3A5C" \
  \
  `# Slightly lighter right panel` \
  -fill "#42405F" -stroke none \
  -draw "rectangle 470,0 1024,500" \
  \
  `# Row A — blue circle with checkmark` \
  -fill "#4A9EFF" -stroke none \
  -draw "circle 130,170 130,225" \
  -draw "roundrectangle 205,143 430,197 22,22" \
  -fill none -stroke white -strokewidth 13 \
  -draw "polyline 106,170 126,193 159,147" \
  \
  `# Row B — orange plain circle` \
  -fill "#FF6B4A" -stroke none \
  -draw "circle 130,310 130,365" \
  -draw "roundrectangle 205,283 430,337 22,22" \
  \
  `# App name` \
  -fill white -font Helvetica-Bold -pointsize 72 \
  -gravity None -annotate +510+210 "PricePick" \
  \
  `# Tagline` \
  -fill "#9A98B8" -font Helvetica -pointsize 26 \
  -annotate +510+258 "Compare unit prices instantly" \
  \
  `# Green accent line under app name` \
  -fill "#00C896" -stroke none \
  -draw "rectangle 510,222 820,228" \
  \
  `# Bottom tag` \
  -fill "#00C896" -font Helvetica-Bold -pointsize 22 \
  -annotate +510+360 "Free  •  No sign-up  •  Works offline" \
  \
  -depth 8 "$OUT/feature-graphic.png"

echo "Done! feature-graphic.png written to $OUT"
