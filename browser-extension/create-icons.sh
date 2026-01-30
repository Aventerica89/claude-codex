#!/bin/bash

# Create placeholder icons for Claude Codex extension
# These are simple colored squares - replace with proper icons later

set -e

ICONS_DIR="icons"
mkdir -p "$ICONS_DIR"

# Create SVG source
cat > "$ICONS_DIR/icon.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <text x="64" y="80" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">C</text>
</svg>
EOF

echo "Created icons/icon.svg"

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
  echo "Converting SVG to PNG with ImageMagick..."

  convert -background none "$ICONS_DIR/icon.svg" -resize 16x16 "$ICONS_DIR/icon16.png"
  convert -background none "$ICONS_DIR/icon.svg" -resize 48x48 "$ICONS_DIR/icon48.png"
  convert -background none "$ICONS_DIR/icon.svg" -resize 128x128 "$ICONS_DIR/icon128.png"

  echo "✅ Icons created:"
  echo "   - icons/icon16.png"
  echo "   - icons/icon48.png"
  echo "   - icons/icon128.png"

elif command -v rsvg-convert &> /dev/null; then
  echo "Converting SVG to PNG with rsvg-convert..."

  rsvg-convert -w 16 -h 16 "$ICONS_DIR/icon.svg" -o "$ICONS_DIR/icon16.png"
  rsvg-convert -w 48 -h 48 "$ICONS_DIR/icon.svg" -o "$ICONS_DIR/icon48.png"
  rsvg-convert -w 128 -h 128 "$ICONS_DIR/icon.svg" -o "$ICONS_DIR/icon128.png"

  echo "✅ Icons created:"
  echo "   - icons/icon16.png"
  echo "   - icons/icon48.png"
  echo "   - icons/icon128.png"

elif command -v sips &> /dev/null && [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Converting SVG to PNG with sips (macOS)..."

  # sips doesn't handle SVG well, so use qlmanage to render to PNG first
  qlmanage -t -s 128 -o "$ICONS_DIR" "$ICONS_DIR/icon.svg" &> /dev/null || true
  mv "$ICONS_DIR/icon.svg.png" "$ICONS_DIR/temp.png" 2>/dev/null || {
    echo "⚠️  sips can't convert SVG directly"
    echo ""
    echo "Please install ImageMagick or use an online converter:"
    echo "   brew install imagemagick"
    echo "   OR https://cloudconvert.com/svg-to-png"
    exit 1
  }

  sips -z 16 16 "$ICONS_DIR/temp.png" --out "$ICONS_DIR/icon16.png" &> /dev/null
  sips -z 48 48 "$ICONS_DIR/temp.png" --out "$ICONS_DIR/icon48.png" &> /dev/null
  sips -z 128 128 "$ICONS_DIR/temp.png" --out "$ICONS_DIR/icon128.png" &> /dev/null
  rm "$ICONS_DIR/temp.png"

  echo "✅ Icons created:"
  echo "   - icons/icon16.png"
  echo "   - icons/icon48.png"
  echo "   - icons/icon128.png"

else
  echo "⚠️  No image converter found"
  echo ""
  echo "Please install one of these:"
  echo "   • ImageMagick: brew install imagemagick (recommended)"
  echo "   • librsvg: brew install librsvg"
  echo ""
  echo "Or convert manually:"
  echo "   1. Open icons/icon.svg in browser"
  echo "   2. Take screenshot at different sizes"
  echo "   3. Save as icon16.png, icon48.png, icon128.png"
  exit 1
fi

echo ""
echo "To create professional icons, use Figma/Sketch and export at:"
echo "   16x16, 48x48, 128x128 pixels"
