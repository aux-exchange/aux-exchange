
function createPalletteValues(key, baseColor) {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  return weights.reduce((acc, cur) => {
    return `${acc}--${key}-${cur}: ${baseColor[cur]};\n`
  }, ``)
}

// TV Color Palette
window.tvColorPalette = {
  primary: colors.slate,
  blue: colors.blue,
  green: colors.green,
  red: colors.red
}

const primary = createPalletteValues('primary', colors.slate)
const secondary = createPalletteValues('secondary', colors.blue)
const accent = createPalletteValues('accent', colors.sky)
const green = createPalletteValues('green', colors.emerald)
const red = createPalletteValues('red', colors.red)
const orange = createPalletteValues('orange', colors.orange)
const brand = createPalletteValues('accent', colors.sky)

const font = 'Lato'
const linkEl = document.createElement('link')
linkEl.setAttribute('rel', 'stylesheet')
linkEl.setAttribute('href', `https://fonts.googleapis.com/css?family=${font}`)
document.head.appendChild(linkEl)
document.title = "AUX"

const tag = document.createElement('style')
tag.setAttribute('type', 'text/css') 
tag.innerHTML = `
  :root {
    ${primary}
    ${secondary}
    ${accent}
    ${green}
    ${red}
    ${orange}
    --brand-default: #00aeef;
    --brand-primary: #262262;
    --brand-secondary: rgb(15 23 42);
    --brand-gradient-start: #0b101d;
    --brand-gradient-mid:#262262;
    --brand-gradient-end: #003448;
    font-family: ${font}, Avenir, Helvetica, Arial, sans-serif;
  }
  `

document.head.appendChild(tag)