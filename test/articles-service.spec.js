const FoldersService = require('../src/folders/folders-service')
const knex = require('knex')

describe(`Folders service object`, function () {
    let db
    let testFolders = [
        {
            id: 1,
            title: 'First test folder!'
        },
        {
            id: 2,
            title: 'Second test folder!'
        },
        {
            id: 3,
            title: 'Third test folder!'
        }
    ]

    before(() => { //opens the connection to the test database BEFORE tests are run
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })
    before(() => db('noteful_folders').truncate())
    before(() => { //inserts the testFolders data into the noteful_folders table BEFORE tests are run
        return db
            .into('noteful_folders')
            .insert(testFolders)
    })
    after(() => db.destroy())  //destroys db AFTER tests are run

    describe(`getAllFolders()`, () => {
        it(`resolves all folders from 'noteful_folders' table`, () => {
            return FoldersService.getAllFolders(db)
                .then(actual => {
                    expect(actual).to.eql(testFolders)
                })
        })
    })
})