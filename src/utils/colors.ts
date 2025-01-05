const generateUniqueColors = (): string[] => {
    const colors = new Set<string>();
  
    while (colors.size < 50) {
      const randomColor = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
      colors.add(randomColor);
    }
  
    return Array.from(colors);
  };

  export const getRandomColor = (): string => {
    const colors = generateUniqueColors();
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };
  