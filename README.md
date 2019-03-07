# babel-plugin-import-postcss [<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS" width="90" height="90" align="right">][postcss]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Support Chat][git-img]][git-url]

[babel-plugin-import-postcss] is a [Babel] plugin that lets you import
[PostCSS] processed CSS in JS.

```js
import styles from 'style.css'; // nav ul { list-style: none; padding-inline: 0; }

/* becomes (with postcss-preset-env) */

var styles = 'nav ul { list-style: none; padding-left: 0; padding-right: 0; }';
```

## Usage

Add [babel-plugin-import-postcss] to your project:

```bash
npm install babel-plugin-import-postcss --save-dev
```

Add [babel-plugin-import-postcss] to your Babel configuration:

```js
const postcssPresetEnv = require('postcss-preset-env');

const targets = '> 0.5%, last 2 versions, Firefox ESR, not dead';

module.exports = {
  plugins: [
    ['import-postcss', {
      plugins: [
        /* add whichever plugins you like */
        postcssPresetEnv({
          browsers: targets
          stage: 0
        })
      ],
      severity: 'ignore'
    }],
    ['@babel/env', {
      loose: true,
      modules: false,
      targets: targets,
      useBuiltIns: 'entry'
    }]
  ]
}
```

## Options

### plugins

The `plugins` option determines the PostCSS plugins used to process CSS.

```js
var postcssImport = require('postcss-import');
var postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [
    ['import-postcss', {
      plugins: [
        postcssImport(),
        postcssPresetEnv({ stage: 0 })
      ],
      severity: 'ignore'
    }]
  ]
}
```

Plugins marked up as JSON are also supported.

```json
{
  "plugins": [
    ["import-postcss", {
      "plugins": [
        "postcss-import",
        ["postcss-preset-env", { "stage": 0 }]
      ]
    }]
  ]
}
```

### extensions

The `extensions` option determines which file extensions will be transformed
by PostCSS. By default, any extension ending in `css` will be transformed.

```js
module.exports = {
  plugins: [
    ['import-postcss', {
      extensions: 'scss',
      syntax: 'postcss-scss'
    }]
  ]
}
```

### severity

The `severity` option determines how errors should be handled. By default
errors are thrown. It is also possible to log errors as a `warning`, or to
`ignore` all warnings.

```js
module.exports = {
  plugins: [
    ['import-postcss', {
      severity: 'ignore'
    }]
  ]
}
```

### Additional Options

Additional options as passed into PostCSS as [Process Options]. Some useful
options include `map` for source map options and `syntax` for transforming
Sass, Less, Stylus, etc.

```js
module.exports = {
  plugins: [
    ['import-postcss', {
      map: {
        inline: true
      }
    }]
  ]
}
```

[cli-img]: https://img.shields.io/travis/csstools/babel-plugin-import-postcss.svg
[cli-url]: https://travis-ci.org/csstools/babel-plugin-import-postcss
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[npm-img]: https://img.shields.io/npm/v/babel-plugin-import-postcss.svg
[npm-url]: https://www.npmjs.com/package/babel-plugin-import-postcss

[Babel]: https://babeljs.io/
[PostCSS]: https://github.com/postcss/postcss
[Process Options]: http://api.postcss.org/global.html#processOptions
[babel-plugin-import-postcss]: https://github.com/csstools/babel-plugin-import-postcss
