const mongoose = require('mongoose')

const User = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    renda: String,
    gastos: String,
    dividas: String,
    saldo: String,
    investimentos: String,
    emprego: String,
})

module.exports = User