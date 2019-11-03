let mongoose = require('mongoose');

let commentsSchema = new mongoose.Schema({
            username:String,
            time:String,
            com_content:String,
            story:  {
                type: mongoose.Types.ObjectId,
                ref: 'Story'
            },
            com_upvotes: {type: Number, default: 0},
            com_downvotes: {type: Number, default: 0}
            },
    { collection: 'comments' });

module.exports = mongoose.model('Comment', commentsSchema);