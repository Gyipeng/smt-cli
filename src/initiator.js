import chalk from 'chalk'
import ora from 'ora'
const download = require('download-git-repo')
const ncp = require('ncp').ncp
const spinner = ora('Downloading template...')

const doDownload = (from, dist) => {
    console.log(from, dist)
    spinner.start()
    return new Promise((resolve, reject) => {
        download(from, dist, err => {
            if (err) {
                reject({
                    status: 0,
                    msg: err
                })
            }
            spinner.stop()
            resolve({
                status: 1,
                msg: `New project has been initialized successfully! Locate in \n${dist}`
            })
        })
    })
}

const doCopy = (from, dist) => {
    console.log(from, dist)
    spinner.start()
    return new Promise((resolve, reject) => {
        ncp(from, dist, err => {
            if (err) {
                reject({
                    status: 0,
                    msg: err
                })
            }
            spinner.stop()
            resolve({
                status: 1,
                msg: `New project has been initialized successfully! Locate in \n${dist}`
            })
        })
    })
}

const initiator = async ({ path, branch, from, dist }) => {
    let dlFrom = ''
    let result
    if (from === 'GitHub' || from === 'GitLab' ) {
        dlFrom = from.toLocaleLowerCase() + ':' + path + '#' + branch
        result = await doDownload(dlFrom, dist)
    } else if (from.startsWith('http')) {
        dlFrom = 'direct:' + from
        result = await doDownload(dlFrom, dist)
    } else {
        result = await doCopy(dlFrom, dist)
    }

    console.log(result.status ? chalk.green(result.msg) : chalk.red(result.msg))
}

export default  initiator