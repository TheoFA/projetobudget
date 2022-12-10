const mongoose = require('mongoose')

const Gasto = mongoose.model('Gasto', {
    name: String,
    categoria: String,
    descrição: String,
    local: String,
    data: String,
    valor: String,
    usuario: String,
})

module.exports = Gasto