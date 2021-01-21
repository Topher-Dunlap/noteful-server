const NotesService = {
    getAllNotes(knex) {
        console.log("inside getAllNotes", knex)
        return knex.select('*').from('noteful_notes')
    },
    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {return knex.from('noteful_notes').select('*').where('id', id).first()
    },
    deleteNote(knex, id) {
        console.log("inside deleteNote notes-service", knex)
        return knex('noteful_notes')
        .where({ id })
        .del()
    },
    // updateNote(knex, id, newNoteFields) {return knex('noteful_notes')
    //     .where({ id })
    //     .update(newNoteFields)
    // },
}

module.exports = NotesService