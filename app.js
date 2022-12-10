/* imports */
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()

//Configurar JSON
app.use(express.json())

//var salt = bcrypt.genSaltSync(10);

//Models
const User = require('./models/User')
const { db } = require('./models/User')


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))

let token


app.get('/', (req, res) => {
  res.render('index.ejs')
}) 

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.get('/form', (req, res) => {
  res.render('form.ejs')
})

app.get('/home', (req, res) => {
  res.render('home.ejs')
})

//Formulario
app.post('/form', async (reg, res) => {

    try{          
       User.collection.replaceOne({ "_id":token._id } , {"name": token.name,
        "email": token.email,
        "password": token.password,
        "renda": reg.body.renda,
        "gastos": reg.body.gastos,
        "dividas": reg.body.dividas,
        "saldo": reg.body.saldo,
        "investimentos": reg.body.investimentos,
        "emprego": reg.body.emprego
       })
  }catch(error){
      console.log(error)
  }

res.redirect('/login')

})

//Login
app.post('/login', async (reg, res) => {

    //Confere se o usuario ja existe
    const userExists = await User.findOne({ email: reg.body.email})

    if(!userExists){ 
      return res.status(442).json(res.redirect('/login'))       
    }

    //const salt = await  bcrypt.genSalt(10)
    // const hashedSenha = await bcrypt.hash(reg.body.senha, salt)
    const hashedSenha = reg.body.senha
    const senhaExist = await User.findOne({ password: hashedSenha})
    

    if(!senhaExist){ 
      return res.status(442).json(res.redirect('/login'))       
    }

    token=userExists

    if(userExists.renda){
      res.redirect({user: userExists} , '/home')
    }else{
      res.redirect('/form')
    }
    

})

//Registra
app.post('/register', async (reg, res) => {

  //Confere se o usuario ja existe
  const userExists = await User.findOne({ email: reg.body.email})

  if(userExists){ 
    return res.status(442).json(res.redirect('/register'))       
  }

try{
    //const salt = await  bcrypt.genSalt(10)
    //const hashedSenha = await bcrypt.hash(reg.body.senha, salt)
    const hashedSenha = reg.body.senha

    //Criar usuario
    const users = new User({
      name: reg.body.name,
      email: reg.body.email,
      password: hashedSenha,
  })

    try{          
       await users.save()
  }catch(error){
      console.log(error)
  }

res.redirect('/login')
}catch{
    res.redirect('/')
}

})


//Credencials
const dbUser = process.env.DB_USER
const dbPassaword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassaword}@cluster0.mn9vq0a.mongodb.net/test`,

).then(() => {
    app.listen(3000)
    console.log("Conectou ao banco")
}).catch((err) => console.log(err))

