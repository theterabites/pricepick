#!/bin/bash
# Generates icon.png, android-icon-foreground.png, android-icon-monochrome.png
# into assets/images/ using ImageMagick

OUT="$(dirname "$0")/../assets/images"

# Shared draw commands (2 rows: blue circle+rect, orange circle+rect, checkmark on row 1)
DRAW_COLORED=(
  -fill "#4A9EFF" -stroke none
  -draw "circle 260,362 260,442"
  -draw "roundrectangle 490,272 844,452 40,40"
  -fill "#FF6B4A"
  -draw "circle 260,662 260,742"
  -draw "roundrectangle 490,572 844,752 40,40"
  -fill none -stroke white -strokewidth 24
  -draw "polyline 230,362 256,390 294,334"
)

DRAW_MONO=(
  -fill white -stroke none
  -draw "circle 260,362 260,442"
  -draw "roundrectangle 490,272 844,452 40,40"
  -fill white
  -draw "circle 260,662 260,742"
  -draw "roundrectangle 490,572 844,752 40,40"
  -fill none -stroke black -strokewidth 24
  -draw "polyline 230,362 256,390 294,334"
)

echo "Generating icon.png..."
magick -size 1024x1024 xc:"#3A3A5C" "${DRAW_COLORED[@]}" "$OUT/icon.png"

echo "Generating android-icon-foreground.png..."
magick -size 1024x1024 xc:none "${DRAW_COLORED[@]}" "$OUT/android-icon-foreground.png"

echo "Generating android-icon-monochrome.png..."
magick -size 1024x1024 xc:none "${DRAW_MONO[@]}" "$OUT/android-icon-monochrome.png"

echo "Generating splash-icon.png..."
magick -size 1024x1024 xc:none \
  -fill "#3A3A5C" -stroke none -draw "roundrectangle 60,60 964,964 120,120" \
  "${DRAW_COLORED[@]}" \
  "$OUT/splash-icon.png"

echo "Done! Files written to $OUT"
