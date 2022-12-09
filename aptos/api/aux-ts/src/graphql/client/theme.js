function createPalletteValues(key, baseColor) {
    const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
    return weights.reduce((acc, cur) => {
      return `${acc}--${key}-${cur}: ${baseColor[cur]};\n`
    }, ``)
  }

const atrixGray = {
  50: '#f9f9f9',
  100: '#ececec',
  200: '#dfdfdf',
  300: '#d2d2d2',
  400: '#acacac',
  500: '#4d4d4d',
  600: '#393939',
  700: '#262626',
  800: '#131313',
  900: '#000'
};

const atrixAccent = {
  100: '#fff',
  200: '#fff',
  300: '#fff',
  400: '#fff',
  500: '#fff',
  600: '#fff',
  700: '#fff',
  800: '#fff',
  900: '#fff'
}

// TV Color Palette
window.config.tvColorPalette = {
  primary: atrixGray,
  blue: colors.blue,
  green: colors.emerald,
  red: colors.red
}

const primary = createPalletteValues('primary', atrixGray)
const secondary = createPalletteValues('secondary', atrixAccent)
const accent = createPalletteValues('accent', atrixAccent)
const green = createPalletteValues('green', colors.emerald)
const red = createPalletteValues('red', colors.red)
const orange = createPalletteValues('orange', colors.orange)
const brand = createPalletteValues('accent', colors.sky)

const font = 'Lexend'
const linkEl = document.createElement('link')
linkEl.setAttribute('rel', 'stylesheet')
linkEl.setAttribute('href', `https://fonts.googleapis.com/css?family=${font}:wght@100;300;400;700;900`)
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
    --brand-default: #fff;
    --brand-primary: #ee1e24;
    --brand-secondary: #df489a;
    --brand-gradient-start: ${colors.black};
    --brand-gradient-mid: ${colors.black};
    --brand-gradient-end: ${colors.black};
    font-family: ${font}, Avenir, Helvetica, Arial, sans-serif;
  }
  `

window.tv_css_vars = tag.innerHTML

document.head.appendChild(tag)
  