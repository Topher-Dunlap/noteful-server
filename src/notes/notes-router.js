const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(
            req.app.get('db'),
        )
            .then(notes => {
                for (let note of notes){
                    note.id = note.id + ""
                    note.folder_id = note.folder_id + ""
                }
                res.json(notes)
            })

            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

        const { name, content, folder_id, modified } = req.body
        const newNote = {name, content, folder_id}

        for (const [key, value] of Object.entries(newNote))
            if (value == null)
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
                newNote.modified = modified;

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(`/notes/${note.id}`)
                res.json({
                    id: note.id,
                    name: xss(note.name), // sanitize name
                    content: xss(note.content), // sanitize content
                    folder_id: note.folder_id
                })
            })
            .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all( (req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                    })
                }
                res.note = note
                next()
                // res.json({
                //     id: note.id,
                //     name: note.name,
                //     content: note.content,
                //     modified: note.modified,
                //     folder_id: note.folder_id
                // })
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        console.log("inside .delete notes-router", req.params.note_id)
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = notesRouter;