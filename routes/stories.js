let express = require('express');
let mongoose = require('mongoose');
require('../connect.js');
require('../models/stories');
const Story = mongoose.model('Story');
let router = express.Router();


router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Story.find(function(err, stories) {
        if (err) {res.send(err);}
        res.send(JSON.stringify(stories,null,5));
    });
};
router.findOne = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Story.find({ "_id" : req.params.id },function(err, story) {
        if (err)
            res.json({ message: 'Story NOT Found!'} );
        else
            res.send(JSON.stringify(story,null,5));
    });
};
router.fuzzySearch = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var keyword = req.params.keyword;
    var _filter={
        $or: [
            {title: {$regex: keyword, $options: '$i'}},
            {content: {$regex: keyword, $options: '$i'}}
        ]
    }
    var count = 0
    Story.count(_filter, function (err, story) {
        if (err) {
            res.json({ message: 'Story NOT Found!'} );
        } else {
            count = story
        }
    })

    Story.find(_filter).limit(10)
        .sort({'_id': -1})
        .exec(function (err, story) {
            if (err)
                res.send(err);
            else
                res.send(JSON.stringify(story,null,5));
        })
};

router.addStory = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var story = new Story();
    story.username = req.body.username;
    story.title = req.body.title;
    story.type = req.body.type;
    story.class = req.body.class;
    story.content = req.body.content;
    story.save(function (err) {
        if (err)
            res.json({message: 'Story not Added!', errmsg: err});
        else
            res.json({message: 'Story Added Successfully!', data: story});
    });
};
router.incrementUpvotes = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Story.findById({ "_id" : req.params.id }, function(err,story) {
        if (err)
            res.send({message:'Story NOT Found - UpVote NOT Successful!!', errmsg: err});
        else {
            story.upvotes += 1;
            story.save(function (err) {
                if (err)
                    res.send(err);
                else
                    res.json({message : 'UpVote Successful' , data : story});
            });
        }
    });
};
router.incrementDownvotes = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Story.findById({ "_id" : req.params.id }, function(err,story) {
        if (err)
            res.send({message:'Story NOT Found - DownVote NOT Successful!!', errmsg: err});
        else {
            story.downvotes += 1;
            story.save(function (err) {
                if (err)
                    res.json({ message: 'Story NOT DownVoted!', errmsg : err } );
                else
                    res.json({message : 'DownVote Successful' , data : story});
            });
        }
    });
};
router.deleteStory = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Story.findByIdAndRemove({ "_id" : req.params.id }, function(err) {
        if (err)
            res.json({message: 'Story NOT Deleted!'});
        else{
            res.json({message: 'Story Successfully Deleted!'});
        }

    });
};
router.editStory =(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var edited_story = {
        title:req.body.title,
        content:req.body.content
    };
    // edited_story.content = markdown.toHTML(edited_story.content);
    Story.update({"_id":req.params.id},{$set:{title:edited_story.title,content:edited_story.content}},function(err){
        if (err)
            res.json({ message: 'Story NOT Edited!', ermsq: err});
        else{
            res.json({message: 'Story Successfully Edited!', story: edited_story});
        }
    });
};
module.exports = router;