import common from 'rollup-plugin-commonjs'

export default {
    input: './src/commands.js',
    output: [{
        file: './dist/index.js',
        format: 'commonjs'
    }],
    plugins: [
        common()
    ]
}