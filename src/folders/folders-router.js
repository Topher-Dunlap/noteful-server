const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(
            req.app.get('db'),
        )
            .then(folders => {
                for (let folder of folders){
                    folder.id = folder.id + ""
                }
                res.json(folders)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

        console.log("inside POST")
        const { name } = req.body
        const newFolder = {name}

        for (const [key, value] of Object.entries(newFolder)) {
            if (value == null) {
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
            }
        }

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(`/folders/${folder.id}`)
                res.json({
                    name: xss(folder.name), // sanitize name
                })
            })
            .catch(next)
    })

foldersRouter
    .route('/:folderId')
    .all( (req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folderId
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist` }
                    })
                }
                res.json({
                    id: folder.id,
                    name: folder.name,
                })
            })
            .catch(next)
    })

module.exports = foldersRouter;