const FoldersService = require('../src/folders/folders-service')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')

describe(`Folders service object`, function () {
    let db

    before(() => { //opens the connection to the test database BEFORE tests are run
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after(() => db.destroy())  //destroys db AFTER tests are run
    before('clean the table', () => db('noteful_folders').truncate()) //clean table before inserting fresh data into table
    afterEach(() => db('noteful_folders').truncate()) //remove all data after each test is ran so one test does not have an effect on the other

    describe(`GET /folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })
        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`getAllFolders() resolves all folders from 'noteful_folders' table`, () => {
                return FoldersService.getAllFolders(db)
                    .then(actual => {
                        expect(actual).to.eql(testFolders)
                    })
            })

            it('responds with 200 and all of the folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })
        })

        describe(`GET /folders/:article_id`, () => {
        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray()
            beforeEach(() => { //insert test data into the table
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })
            it('GET /folders/:folder_id responds with 200 and the specified folder', () => {
                const folder_id = 2
                const expectedFolder = testFolders[folder_id - 1]
                return supertest(app)
                    .get(`/folders/${folder_id}`)
                    .expect(200, expectedFolder)
            })
            it(`getById() resolves an folder by id from 'noteful_folders' table`, () => {
                const thirdId = 3
                const thirdTestFolder = testFolders[thirdId - 1]
                return FoldersService.getById(db, thirdId)
                    .then(actual => {
                        expect(actual).to.eql({
                            id: thirdId,
                            name: thirdTestFolder.name,
                        })
                    })
            })
            })
        })

        context(`Given 'noteful_folder' has no data`, () => {
            it(`getAllFolders() resolves an empty array`, () => {
                return FoldersService.getAllFolders(db)
                    .then(actual => {
                        expect(actual).to.eql([])
                    })
            })
            it(`insertFolder() inserts a new folder and resolves the new folder with an 'id'`, () => {
                const newFolder = {
                    name: 'Test new name',
                }
                return FoldersService.insertFolder(db, newFolder)
            })
        })
    })
})