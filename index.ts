import pkg from './package.json'

console.log(`${pkg.name}@${pkg.version}`)

export {parse} from './src/parse'
export {RenderReact} from './src/RenderReact'