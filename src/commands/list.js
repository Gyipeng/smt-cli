
import DB from '../db'
import listTable from '../table'

async function listTemplates () {
    const tplList = await DB.find({})
    listTable(tplList)
}

export default listTemplates