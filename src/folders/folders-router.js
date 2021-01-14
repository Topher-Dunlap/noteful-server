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
                    res.json(folders)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

        console.log("inside POST")
        const { title } = req.body
        const newFolder = {title}

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
                    title: xss(folder.title), // sanitize title
                })
            })
            .catch(next)
    })

module.exports = foldersRouter;