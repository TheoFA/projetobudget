const mongoose = require('mongoose')

const Divida = mongoose.model('Divida', {
    name: String,
    data: String,
    valor: String,
    devedor: String,
    usuario: String,
    numero: String,
})

module.exports = Divida