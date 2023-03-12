# Skinning AUX UI
**v0.0.0** - *10/12/2022*



> Disclaimer: This project is a WIP and will see many changes in the near term. We are wrapping up wallet interactions and some endpoints within the graphql API may be unstable.

# Getting Started

1. Clone `aux-ts` library and follow relevant documentation in repo
2. View the app by running `npx serve <name of this directory>` or replace dist with name of this directory if different.

# How to customize your DEX

### Notes: This project leverages tailwindcss, we have temporarily hardcoded their color tokens in the file `colors.js` you can utilize these palettes as shown in the examples below to rapidly theme your app.

1. Replace the `logo.svg` with your own logo - if you are using a different format, you'll need to replace the string reference to `logo.svg` within the bundle.
2. Customize variables in `theme.js` file to guide look and feel throughout the app. See examples below. 
3. Edit the content of `config.js` for desired graphql endpoints and app title. By default these values point to localhost:4000/graphql and title your app DEX. Before you deploy ensure you're managing correct config to point to prod endpoints.

Currently we only support colors but we will iterate and enhance the ability to theme until we are ready to open source the entire codebase. To change the color palette of the app you may do the following

```js
const primary = createPalletteValues('primary', colors['your color of choice'])
```

The app is themed using color palettes ranging from 100-900. 

For example: 

`red-100` = lightest red

`red-900` = darkest red

This app is configured to use the `slate` palette as its primary. But you will notice that changing color to a different palette reasonably reskins the app with appropriate dark/light shades of whichever palette you choose. 

Token names are subject to change so they make more semantic sense. In general the refer to the following notes to make sense of this configuration

1. This app currently supports dark mode, light theme is in the works
2. The `primary` palette is used for card backgrounds and most visual elements as backdrops and contrast text over brighter colors
3. The `secondary` palette is used for certain action & focus states
4. The `accent` palette is used for things like borders and other accent areas
5. The `brand` colors are used for various things and will likely be mapped to something more semantically meaningful in coming iterations
6. The `green` and `red` palettes are used for success/error and relevant financial indicators

### Roadmap

Following white label features are coming soon:

1. Element border radiuses
2. Standard padding increments
3. Font sizes
4. Typography attributes
5. Longer term we **may** introduce things like feature flags & dynamic content for copy + i18n
6. Whatever else comes to mind as a reasonable addition