let mongoose = require('mongoose');

let storiesSchema = new mongoose.Schema({
        username:String,
        title:{
                unique: true,
                type: String,
        },
        type: String,
        class: String,
        publishTime:String,
        content: String,
        written_times: {type: Number, default: 0},
        upvotes: {type: Number, default: 0},
        downvotes: {type: Number, default: 0}
    },
    { collection: 'stories' });

module.exports = mongoose.model('Story', storiesSchema);