#!/bin/bash
# Generates icon.png, android-icon-foreground.png, android-icon-monochrome.png
# into assets/images/ using ImageMagick

OUT="$(dirname "$0")/../assets/images"

# Layout (all elements kept within radius 380 from center 512,512 for circular mask safety)
# PAD=280, DOT_R=65, ROW_H=180, GAP=60, RECT_X=450, RECT_W=294
# Row A cy=392, Row B cy=632

DRAW_COLORED=(
  -fill "#4A9EFF" -stroke none
  -draw "circle 345,392 345,457"
  -draw "roundrectangle 450,312 744,472 35,35"
  -fill "#FF6B4A"
  -draw "circle 345,632 345,697"
  -draw "roundrectangle 450,552 744,712 35,35"
  -fill none -stroke white -strokewidth 18
  -draw "polyline 320,392 342,415 372,369"
)

DRAW_MONO=(
  -fill white -stroke none
  -draw "circle 345,392 345,457"
  -draw "roundrectangle 450,312 744,472 35,35"
  -fill white
  -draw "circle 345,632 345,697"
  -draw "roundrectangle 450,552 744,712 35,35"
  -fill none -stroke black -strokewidth 18
  -draw "polyline 320,392 342,415 372,369"
)

echo "Generating icon.png..."
magick -size 1024x1024 xc:"#3A3A5C" "${DRAW_COLORED[@]}" -depth 8 "$OUT/icon.png"

echo "Generating android-icon-foreground.png..."
magick -size 1024x1024 xc:none "${DRAW_COLORED[@]}" -depth 8 "$OUT/android-icon-foreground.png"

echo "Generating android-icon-background.png..."
magick -size 1024x1024 xc:"#3A3A5C" -depth 8 "$OUT/android-icon-background.png"

echo "Generating android-icon-monochrome.png..."
magick -size 1024x1024 xc:none "${DRAW_MONO[@]}" -depth 8 "$OUT/android-icon-monochrome.png"

echo "Generating splash-icon.png..."
magick -size 1024x1024 xc:none \
  -fill "#3A3A5C" -stroke none -draw "roundrectangle 60,60 964,964 120,120" \
  "${DRAW_COLORED[@]}" -depth 8 \
  "$OUT/splash-icon.png"

echo "Done! Files written to $OUT"
