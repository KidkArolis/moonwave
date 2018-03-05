const shell = require('execa').shell

const sh = (...args) => shell(...args, { stdio: 'inherit' })

const files = [
  'moonwave.js',
  'react.js',
  'preact.js',
  'log.js',
  'devtools.js',
  'package.json',
  'yarn.lock',
  'CHANGELOG.md',
  'README.md'
]

;(async function () {
  await sh('npm test')

  await sh('rm -rf dist')
  await sh('mkdir -p dist')


  for (let file of files) {
    await sh(`cp ${file} dist`)
    if (file.endsWith('.js')) {
      let args = ''
      if (file.endsWith('preact.js')) {
        args = '--jsx Preact.h'
      }
      await sh(`./node_modules/.bin/buble ${args} dist/${file} -o dist/${file}`)
    }
  }

  await sh(`yarn version`)
  const version = require('package.json').version

  fs.writeFileSync(
    './dist/package.json',
    JSON.stringify(
      Object.assign({}, require('./dist/package.json'), { version })
    , null, 2)
  )

  process.chdir('./dist')
  await sh('yarn publish')
}())
