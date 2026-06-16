#!/bin/bash

# New Cadent color scheme
# Primary Purple: #6B4A9F (from logo)
# Light Purple: #8B7AB8
# Accent Purple: #9D8AC7
# Keep Orange as secondary: #E88948

cd /workspaces/default/code/src/app/components

# Replace teal color (#3B9FB5) with purple (#6B4A9F)
find . -name "*.tsx" -type f -exec sed -i 's/#3B9FB5/#6B4A9F/g' {} \;

# Replace teal rgba background with purple rgba
find . -name "*.tsx" -type f -exec sed -i 's/rgba(59, 159, 181, 0\.15)/rgba(107, 74, 159, 0.12)/g' {} \;

# Replace teal rgba with lower opacity
find . -name "*.tsx" -type f -exec sed -i 's/rgba(59, 159, 181,/rgba(107, 74, 159,/g' {} \;

# Update gradient backgrounds - now purple to orange
# These are already being replaced by the #3B9FB5 replacement above

echo "Color scheme updated to Cadent purple!"
