const mongoose = require('mongoose')

const Meta = mongoose.model('Meta', {
    name: String,
    descrição: String,
    total: String,
    atual: String,
    numero: String,
    usuario: String,
})

module.exports = Meta