let express = require('express');
let mongoose = require('mongoose');
require('./connect.js');
require('../models/comments');
require('../models/stories');
const Story = mongoose.model('Story');
const Comment = mongoose.model('Comment');
let router = express.Router();

router.findCommentWithStory =(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Comment.find({'story': req.params.id},function(err, comments) {
        if (err)
            res.send(err);
        else {
            res.send(comments);
        }
    });
} ;

router.addComment = (req, res) => {
    /*
        Add a piece of comment to the story whose id has been given.
     */
    res.setHeader('Content-Type', 'application/json');
    Story.findById({ "_id" : req.params.id }, function(err,story) {
        if (err)
            res.send({message:'Story NOT Found'});
        else {
            var comment = new Comment();
            comment.username = req.body.username;
            comment.com_content = req.body.com_content;
            comment.story = story._id;
            comment.save(function (err) {
                if (err)
                    res.json({message: 'Comment not Added!', errmsg: err});
                else {
                    res.json({message: 'Comment Added Successfully!', data: comment});
                    story.written_times += 1;
                    story.save();
                }
            });
        }
    });
} ;

router.deleteComment = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Story.findById({ "_id" : req.params.story_id }, function(err,story) {
        if (err)
            res.send({message:'Story NOT Found'});
        else {
            Comment.findByIdAndRemove({ "_id" : req.params.comment_id }, function(err) {
                if (err)
                    res.json({message: 'Story NOT Deleted!'});
                else{
                    res.json({message: 'Story Successfully Deleted!'});
                    story.written_times -= 1;
                    story.save();
                }
            });
        }
    });
} ;
module.exports = router;