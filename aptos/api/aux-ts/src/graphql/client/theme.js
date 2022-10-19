function createPalletteValues(key, baseColor) {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  return weights.reduce((acc, cur) => {
    return `${acc}--${key}-${cur}: ${baseColor[cur]};\n`
  }, ``)
}

const primary = createPalletteValues('primary', colors.zinc)
const secondary = createPalletteValues('secondary', colors.emerald)
const accent = createPalletteValues('accent', colors.emerald)
const green = createPalletteValues('green', colors.emerald)
const red = createPalletteValues('red', colors.red)
const orange = createPalletteValues('orange', colors.orange)
const brand = createPalletteValues('accent', colors.sky)

const font = 'Space Grotesk'
const linkEl = document.createElement('link')
linkEl.setAttribute('rel', 'stylesheet')
linkEl.setAttribute('href', `https://fonts.googleapis.com/css?family=${font}`)
document.head.appendChild(linkEl)
document.title = 'Mojito'

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
    --brand-default: ${colors.emerald[300]};
    --brand-primary: ${colors.emerald[400]};
    --brand-secondary: ${colors.lime[200]};
    --brand-gradient-start: ${colors.emerald[900]};
    --brand-gradient-mid: ${colors.emerald[500]};
    --brand-gradient-end: ${colors.lime[800]};
    font-family: ${font}, Avenir, Helvetica, Arial, sans-serif;
  }
  `


window.tv_overrides = tv_overrides

document.head.appendChild(tag)
