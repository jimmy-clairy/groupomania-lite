// Importation du package 'mongoose'
const mongoose = require('mongoose');

// Création du schéma pour la base de données MongoDB
const postSchema = mongoose.Schema(
    {
        posterId: {
            type: String,
            required: true
        },
        posterPseudo: {
            type: String,
            required: true
        },
        txtContent: {
            type: String,
            maxlength: 250,
            required: true
        },
        imageUrl: {
            type: String,
        },
        likers: {
            type: [String]
        },
    },
    {
        timestamps: true
    }
);

// Exportation du schéma
module.exports = mongoose.model('Post', postSchema);