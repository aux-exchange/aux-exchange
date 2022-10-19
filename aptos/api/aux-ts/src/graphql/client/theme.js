function createPalletteValues(key, baseColor) {
    const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
    return weights.reduce((acc, cur) => {
      return `${acc}--${key}-${cur}: ${baseColor[cur]};\n`
    }, ``)
  }
  
  const primary = createPalletteValues('primary', colors.stone)
  const secondary = createPalletteValues('secondary', colors.teal)
  const accent = createPalletteValues('accent', colors.teal)
  const green = createPalletteValues('green', colors.teal)
  const red = createPalletteValues('red', colors.red)
  const orange = createPalletteValues('orange', colors.orange)
  const brand = createPalletteValues('accent', colors.sky)
  
  
  
  const font = 'Rubik'
  const linkEl = document.createElement('link')
  linkEl.setAttribute('rel', 'stylesheet')
  linkEl.setAttribute('href', `https://fonts.googleapis.com/css?family=${font}`)
  document.head.appendChild(linkEl)
  
  const tag = document.createElement('style')
  tag.setAttribute('type', 'text/css') 
  tag.innerHTML = `
    :root {
      ${primary}
      ${secondary}
      ${accent}
      ${green}
      ${orange}
      ${red}
      --brand-default: ${colors.teal[300]};
      --brand-primary: ${colors.teal[400]};
      --brand-secondary: ${colors.sky[200]};
      --brand-gradient-start: ${colors.teal[900]};
      --brand-gradient-mid: ${colors.teal[500]};
      --brand-gradient-end: ${colors.sky[800]};
      font-family: ${font}, Avenir, Helvetica, Arial, sans-serif;
    }
    `
  
  document.head.appendChild(tag)
  