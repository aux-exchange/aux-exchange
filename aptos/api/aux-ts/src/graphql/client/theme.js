function createPalletteValues(key, baseColor) {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  return weights.reduce((acc, cur) => {
    return `${acc}--${key}-${cur}: ${baseColor[cur]};\n`
  }, ``)
}

// TV Color Palette
window.config.tvColorPalette = {
  primary: colors.zinc,
  blue: colors.blue,
  green: colors.emerald,
  red: colors.red,
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
linkEl.setAttribute('href', `https://fonts.googleapis.com/css?family=${font}:wght@100;300;400;700;900`)
document.head.appendChild(linkEl)

// --brand-gradient-start: rgb(30,58,66);
// --brand-gradient-mid: rgb(13,15,15);
// --brand-gradient-end: rgb(34,71,71);

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

    font-family: ${font}, Avenir, Helvetica, Arial, sans-serif;
  }
  #bgcontainer {
    background-image: url(https://app.mojito.markets/_next/static/media/bg-min.8fd9fd65.png)
  }
  `

document.head.appendChild(tag)
