import datastore from 'nedb'
import { resolve } from 'path'

const db = new datastore({
    filename: resolve(__dirname, './db'),
    autoload: true
})

class DB {
    static find (condition) {
        return new Promise((resolve, reject) => {
            db.find(null, condition, (err, docs) => {
                if (err) reject(err)
                resolve(docs)
            })
        })
    }
    static insert (doc) {
        return new Promise((resolve, reject) => {
            db.insert(doc, (err, newDoc) => {
                if (err) reject(err)
                resolve(newDoc)
            })
        })
    }
    static remove (condition) {
        return new Promise((resolve, reject) => {
            db.remove(condition, (err, newDoc) => {
                if (err) reject(err)
                resolve(newDoc)
            })
        })
    }
}

export default  DB