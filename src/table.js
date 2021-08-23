import Table from 'cli-table'

const table = new Table({
    head: ['Template Name', 'Owner/Name', 'Branch', 'From'],
    style: {
        head: ['green']
    }
})




export default (tplList, autoExit = true) => {
    tplList.forEach(({ name, path, branch, from }) => {
        table.push([name, path, branch, from])
        if (table.length === tplList.length) {
            console.log(table.toString())
            autoExit && process.exit()
        }
    })
}