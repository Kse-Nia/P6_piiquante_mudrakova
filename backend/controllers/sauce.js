const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce enregistrée !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
};


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            console.log("sauce");
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            console.log("sauce non trouvé");
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {

    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...req.body,
            _id: req.params.id
        })
        .then(
            () => {
                res.status(201).json({
                    message: 'Sauce modifiée avec succès !'
                });
            }
        ).catch(
            (error) => {
                res.status(400).json({
                    error: error
                });
            }
        );
};


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({
                        message: 'Sauce supprimée'
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            });
        })
        .catch(error => res.status(500).json({
            error
        }));
};


exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};


// Like and Dislike part

exports.likeDislike = (req, res, next) => {
    let like = req.body.like;
    let sauceID = req.params.id;
    let userId = req.body.userId;

    switch (like) {
        case 1:
            Sauce.updateOne({
                    _id: sauceID
                }, {
                    $push: {
                        usersLiked: userId
                    },
                    $inc: {
                        likes: +1
                    }
                })
                .then(() => res.status(200).json({
                    message: `Votre like a été ajouté`
                }))
                .catch((error) => res.status(400).json({
                    error
                }))

            break;

        case 0:
            Sauce.findOne({
                    _id: sauceID
                })
                .then((sauce) => {
                    if (sauce.usersLiked.includes(userId)) {
                        Sauce.updateOne({
                                _id: sauceID
                            }, {
                                $pull: {
                                    usersLiked: userId
                                },
                                $inc: {
                                    likes: -1
                                }
                            })
                            .then(() => res.status(200).json({
                                message: `like annulé`
                            }))
                            .catch((error) => res.status(400).json({
                                error
                            }))
                    }
                    if (sauce.usersDisliked.includes(userId)) {
                        Sauce.updateOne({
                                _id: sauceID
                            }, {
                                $pull: {
                                    usersDisliked: userId
                                },
                                $inc: {
                                    dislikes: -1
                                }
                            })
                            .then(() => res.status(200).json({
                                message: `dislike annulé`
                            }))
                            .catch((error) => res.status(400).json({
                                error
                            }))
                    }
                })
                .catch((error) => res.status(404).json({
                    error
                }))
            break;

        case -1:
            Sauce.updateOne({
                    _id: sauceID
                }, {
                    $push: {
                        usersDisliked: userId
                    },
                    $inc: {
                        dislikes: +1
                    }
                })
                .then(() => {
                    res.status(200).json({
                        message: `Dislike ajouté`
                    })
                })
                .catch((error) => res.status(400).json({
                    error
                }))
            break;

        default:
            console.log(error);
    }

}