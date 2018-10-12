## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

- HTML 수정: `index.ejs`를 수정하시면 됩니다.
- JS 수정: `/app/index.js`를 수정하시면 됩니다.
- CSS 수정: `/assets/styles/index.less`를 수정하시면 됩니다. (파일 형식을 `.scss`로 바꿔서 SCSS를 사용하여도 됩니다.)

## [webpack](https://webpack.js.org/)
If you're not familiar with webpack, the [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) will serve the static files in your build folder and watch your source files for changes.
When changes are made the bundle will be recompiled. This modified bundle is served from memory at the relative path specified in publicPath.
