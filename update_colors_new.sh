#!/bin/bash

# Update color scheme from purple/orange to cool blue/silver
# Old colors:
# - #6B4A9F (purple) → #5B9BD5 (cool blue)
# - #E88948 (orange) → #9CA3AF (soft silver/grey)
# - rgba(107, 74, 159, 0.12) → rgba(91, 155, 213, 0.08) (light cool blue background)
# - #4A5568 → #B8B8B8 (soft silver)
# - #D97436 → #7B9FAF (lighter cool blue-grey)

find src/app/components -name "*.tsx" -type f -exec sed -i \
  -e 's/#6B4A9F/#5B9BD5/g' \
  -e 's/#E88948/#9CA3AF/g' \
  -e 's/rgba(107, 74, 159, 0\.12)/rgba(91, 155, 213, 0.08)/g' \
  -e 's/#4A5568/#B8B8B8/g' \
  -e 's/#D97436/#7B9FAF/g' \
  {} \;

echo "Color scheme updated to cool blue and soft silver"
