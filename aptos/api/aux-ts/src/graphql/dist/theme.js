function createPalletteValues(key, baseColor) {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  return weights.reduce((acc, cur) => {
    return `${acc}--${key}-${cur}: ${baseColor[cur]};\n`
  }, ``)
}

const primary = createPalletteValues('primary', colors.slate)
const secondary = createPalletteValues('secondary', colors.blue)
const accent = createPalletteValues('accent', colors.sky)
const green = createPalletteValues('green', colors.emerald)
const red = createPalletteValues('red', colors.red)
const brand = createPalletteValues('accent', colors.sky)

const tag = document.createElement('style')
tag.setAttribute('type', 'text/css') 
tag.innerHTML = `
  :root {
    ${primary}
    ${secondary}
    ${accent}
    ${green}
    ${red}
    --brand-default: #00aeef;
    --brand-primary: #262262;
    --brand-secondary: rgb(15 23 42);
    --brand-gradient-start: #0b101d;
    --brand-gradient-mid:#262262;
    --brand-gradient-end: #003448;
  }
  `

document.head.appendChild(tag)
