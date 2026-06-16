#!/bin/bash

# Replace h-8 logos
sed -i 's|<img src={logoImage} alt="Cadent" className="h-8" />|<CadentLogo height="sm" />|g' *.tsx

# Replace h-8 inverted logos
sed -i 's|<img src={logoImage} alt="Cadent" className="h-8 brightness-0 invert" />|<CadentLogo height="sm" inverted={true} />|g' *.tsx

# Replace h-10 logos
sed -i 's|<img src={logoImage} alt="Cadent" className="h-10" />|<CadentLogo height="md" />|g' *.tsx

# Replace h-12 logos
sed -i 's|<img src={logoImage} alt="Cadent" className="h-12 mb-6" />|<CadentLogo height="md" className="mb-6" />|g' *.tsx

# Replace h-16 logos
sed -i 's|<img src={logoImage} alt="Cadent" className="h-16" />|<CadentLogo height="lg" />|g' *.tsx
