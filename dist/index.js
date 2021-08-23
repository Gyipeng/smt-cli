'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var inquirer = require('inquirer');
var datastore = _interopDefault(require('nedb'));
var path = require('path');
var Table = _interopDefault(require('cli-table'));
var chalk = _interopDefault(require('chalk'));
var ora = _interopDefault(require('ora'));

const db = new datastore({
    filename: path.resolve(__dirname, './db'),
    autoload: true
});

class DB {
    static find (condition) {
        return new Promise((resolve, reject) => {
            db.find(null, condition, (err, docs) => {
                if (err) reject(err);
                resolve(docs);
            });
        })
    }
    static insert (doc) {
        return new Promise((resolve, reject) => {
            db.insert(doc, (err, newDoc) => {
                if (err) reject(err);
                resolve(newDoc);
            });
        })
    }
    static remove (condition) {
        return new Promise((resolve, reject) => {
            db.remove(condition, (err, newDoc) => {
                if (err) reject(err);
                resolve(newDoc);
            });
        })
    }
}

const table = new Table({
    head: ['Template Name', 'Owner/Name', 'Branch', 'From'],
    style: {
        head: ['green']
    }
});




var listTable = (tplList, autoExit = true) => {
    tplList.forEach(({ name, path, branch, from }) => {
        table.push([name, path, branch, from]);
        if (table.length === tplList.length) {
            console.log(table.toString());
            autoExit && process.exit();
        }
    });
};

async function addTemplate () {
    const tplList = await DB.find({});

    const questions = [{
        type: 'input',
        name: 'name',
        message: 'Set the custom name of the template:',
        validate (val) {
            let result = true;
            if (!val) {
                result = 'Template name cannot be empty.';
            } else if (tplList.some(({ name }) => name === val)) {
                result = `Template with name "${val}" is exist.`;
            }
            return result
        }
    },
        {
            type: 'list',
            name: 'from',
            message: 'Where is the template from?',
            choices: ['GitHub', 'GitLab', 'Others']
        },
        {
            type: 'input',
            name: 'from',
            when: ({ from }) => {
                if (from === 'Others') {
                    return true
                }
            },
            filter: (val) => {
                if (val.startsWith('.')) {
                    val = process.cwd() + '/' + val;
                }
                return val
            }
        },
        {
            type: 'input',
            name: 'path',
            message: 'Owner/Name of the template:',
            when: ({ from }) => {
                if (!['GitHub', 'GitLab'].includes(from)) {
                    return false
                } else {
                    return true
                }
            },
            validate (val) {
                if (val !== '') {
                    return true
                }
                return 'Path is required!'
            }
        },
        {
            type: 'input',
            name: 'branch',
            message: 'Branch of the template:',
            default: 'master',
            when: ({ from }) => {
                if (!['GitHub', 'GitLab'].includes(from)) {
                    return false
                } else {
                    return true
                }
            },
        }];

    inquirer.prompt(questions).then(async ({ name, path = '---', branch = '---', from }) => {
        const template = {
            name,
            path,
            branch,
            from
        };
        await DB.insert(template);
        const newList = await DB.find({});
        listTable(newList, 'New template has been added successfully!');
    });
}

async function listTemplates () {
    const tplList = await DB.find({});
    listTable(tplList);
}

async function deleteTemplate () {
    const tplList = await DB.find({});

    const questions = [{
        type: 'rawlist',
        name: 'name',
        message: 'Select a template to delete:',
        choices: () => tplList.map(tpl => {
            return {
                name: tpl.name,
                value: tpl.name,
            }
        })
    }];

    inquirer.prompt(questions).then(async ({ name }) => {
        await DB.remove({ name });
        const newList = await DB.find({});
        listTable(newList, 'New templates has been updated successfully!');
    });
}

const download = require('download-git-repo');
const ncp = require('ncp').ncp;
const spinner = ora('Downloading template...');

const doDownload = (from, dist) => {
    console.log(from, dist);
    spinner.start();
    return new Promise((resolve, reject) => {
        download(from, dist, err => {
            if (err) {
                reject({
                    status: 0,
                    msg: err
                });
            }
            spinner.stop();
            resolve({
                status: 1,
                msg: `New project has been initialized successfully! Locate in \n${dist}`
            });
        });
    })
};

const doCopy = (from, dist) => {
    console.log(from, dist);
    spinner.start();
    return new Promise((resolve, reject) => {
        ncp(from, dist, err => {
            if (err) {
                reject({
                    status: 0,
                    msg: err
                });
            }
            spinner.stop();
            resolve({
                status: 1,
                msg: `New project has been initialized successfully! Locate in \n${dist}`
            });
        });
    })
};

const initiator = async ({ path, branch, from, dist }) => {
    let dlFrom = '';
    let result;
    if (from === 'GitHub' || from === 'GitLab' ) {
        dlFrom = from.toLocaleLowerCase() + ':' + path + '#' + branch;
        result = await doDownload(dlFrom, dist);
    } else if (from.startsWith('http')) {
        dlFrom = 'direct:' + from;
        result = await doDownload(dlFrom, dist);
    } else {
        result = await doCopy(dlFrom, dist);
    }

    console.log(result.status ? chalk.green(result.msg) : chalk.red(result.msg));
};

async function initTemplate () {
    const tplList = await DB.find({});
    listTable(tplList,false);

    const questions = [{
        type: 'rawlist',
        name: 'tplName',
        message: 'Select a template:',
        choices: () => tplList.map(tpl => {
            return {
                name: tpl.name,
                value: tpl.name,
            }
        })
    }, {
        type: 'input',
        name: 'project',
        message: 'Project name:',
        default: (lastAnswer) => {
            return lastAnswer.tplName
        }
    }];

    inquirer.prompt(questions).then(async ({ tplName, project }) => {
        const tpl = tplList.filter(({ name }) => name === tplName)[0];
        const { path, branch, from } = tpl;
        const pwd = process.cwd();
        initiator({ path, branch, from, dist: `${pwd}/${project}` });
    });
}

exports.add = addTemplate;
exports.del = deleteTemplate;
exports.init = initTemplate;
exports.list = listTemplates;
