let mongoose = require('mongoose');

let UsrSchema = new mongoose.Schema({
        name: String,
        pwd: String,
    },
    { collection: 'usr' });

module.exports = mongoose.model('Usr', UsrSchema);