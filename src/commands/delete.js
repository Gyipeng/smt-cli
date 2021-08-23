import { prompt } from 'inquirer'
import DB from '../db'
import listTable from '../table'

async function deleteTemplate () {
    const tplList = await DB.find({})

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
    }]

    prompt(questions).then(async ({ name }) => {
        await DB.remove({ name })
        const newList = await DB.find({})
        listTable(newList, 'New templates has been updated successfully!')
    })
}

export default deleteTemplate