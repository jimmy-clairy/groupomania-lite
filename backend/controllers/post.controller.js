// Importation des packages
const fs = require('fs');
const PostModel = require('../models/Post.model');
const UserModel = require('../models/User.model');

exports.createPost = (req, res, next) => {
    const post = new PostModel({
        posterId: req.auth.userId,
        post: req.body.post,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likers: [],
    });
    post.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifyPost = (req, res) => {

    if (req.file) {
        PostModel.findOne({ _id: req.params.id })
            .then(post => {
                if (req.auth.adminId || post.posterId === req.auth.userId) {
                    // Supprime l'ancienne image
                    const filename = post.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        const postObject = {
                            post: req.body.post,
                            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                        }
                        PostModel.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Post modifiée!' }))
                            .catch(error => res.status(400).json({ error }));
                    })
                } else {
                    res.status(401).json({ message: 'Not authorized' });
                }

            })
            .catch(error => res.status(500).json({ error }));
    } else {
        const postObject = { ...req.body };
        PostModel.findOne({ _id: req.params.id })
            .then(post => {
                if (req.auth.adminId || post.posterId === req.auth.userId) {
                    PostModel.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Post modifiée!' }))
                        .catch(error => res.status(401).json({ error }));
                } else {
                    res.status(401).json({ message: 'Not authorized' });
                }
            })
            .catch((error) => {
                res.status(400).json({ error });
            });
    }
};

exports.deleteOnePost = (req, res) => {
    PostModel.findOne({ _id: req.params.id })
        .then(post => {
            if (req.auth.adminId || post.posterId === req.auth.userId) {
                // Supprime l'image
                const filename = post.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    PostModel.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Post supprimée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            } else {
                res.status(401).json({ message: 'Non autoriser' });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllPosts = (req, res) => {
    PostModel.find()
        .then(posts => res.status(200).json(posts))
        .catch(error => res.status(400).json({ error }))
};

exports.likePost = (req, res) => {
    try {
        PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id }
            },
            { new: true },
            (err, docs) => {
                if (err) res.status(400).send(err);
                else return res.send(docs);
            }
        )
        UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id }
            },
            { new: true },
            (err) => {
                if (err) return res.status(400).send(err);
            }
        )
    } catch (err) {
        return res.status(402).send(err);
    }
};

exports.unlikePost = (req, res) => {
    try {
        PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id }
            },
            { new: true },
            (err, docs) => {
                if (err) res.status(400).send(err);
                else return res.send(docs);
            }
        )
        UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id }
            },
            { new: true },
            (err) => {
                if (err) return res.status(400).send(err);
            }
        )
    } catch (err) {
        return res.status(400).send(err);
    }
};