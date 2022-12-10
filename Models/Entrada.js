const mongoose = require('mongoose')

const Entrada = mongoose.model('Entrada', {
    name: String,
    categoria: String,
    descrição: String,
    local: String,
    data: String,
    valor: String,
    usuario: String,
})

module.exports = Entrada