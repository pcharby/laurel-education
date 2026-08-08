import logoOnlyImage from '../../imports/LaurelLogoOnly.png';
import logoWithTextImage from '../../imports/LaurelEducationLogo.png';

interface LaurelLogoProps {
  height?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  inverted?: boolean;
  showProductName?: boolean;
}

export function LaurelLogo({ height = 'md', className = '', inverted = false, showProductName = false }: LaurelLogoProps) {
  const heightMap = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-[83px]',
  };

  return (
    <div className={`${heightMap[height]} ${className}`}>
      <img
        src={showProductName ? logoWithTextImage : logoOnlyImage}
        alt="Laurel Education"
        className={`h-full w-auto object-contain ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </div>
  );
}
