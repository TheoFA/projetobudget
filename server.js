/* imports */
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()

//Configurar JSON
app.use(express.json())

//Models
const User = require('./models/User')
const { db } = require('./models/User')
const Gasto = require('./models/Gasto')
const Entrada = require('./models/Entrada')
const Meta = require('./models/Meta')
const Divida = require('./models/Divida')
app.engine('html', require('ejs').renderFile);
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(express.static(__dirname + '/static', {index: 'pages-sign-in.html'}))

//Variaveis Globais
let token="Teste"

//Funcões
function compare(a,b) {
  return a.data < b.data;
}

function somarMes(date, months) {
  date.setMonth(date.getMonth() + months);
  return date;
}

//Get's de pagina

app.get('/home', async (req, res) => {
  let valor=0
  let quant=0;
  let valor_e=0
  let quant_e=0;
  let dados_g = [0,0,0,0,0,0,0,0,0,0,0,0]
  let dados_e = [0,0,0,0,0,0,0,0,0,0,0,0]
  let dados = []

  const banco = await Gasto.find({ usuario: token._id}).sort({data:1})
  const ent = await Entrada.find({ usuario: token._id}).sort({data:1})
 
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed)
  let t =  new Date (today.toLocaleDateString('en-CA'))
  let hj = new Date (today.toLocaleDateString('en-CA'))
  t.setDate(t.getDate() - 7)
 
 for (let cat of banco){

  if(new Date(cat.data) >= t && new Date(cat.data) <= hj){
    quant++
    valor = parseInt(valor) + parseInt(cat.valor)
  }
}

for (let x of ent){

  if(new Date(x.data) >= t && new Date(x.data) <= hj){
    quant_e++
    valor_e = parseInt(valor_e) + parseInt(x.valor)
  }
}


let mes_G = await Gasto.find({ usuario: token._id}).sort({data:1})

for(let i=0;i<12;i++){
  for (let x of mes_G){
    if(i+1 == parseInt(x.data[5] + x.data[6] )){
      dados_g[i] = dados_g[i] + (+x.valor)  
    }
      
  }
}


let mes_E = await Entrada.find({ usuario: token._id}).sort({data:1})

for(let i=0;i<12;i++){
  for (let x of mes_E){
    if(i+1 == parseInt(x.data[5] + x.data[6] )){
      dados_e[i] = dados_e[i] + (+x.valor)  
    }
      
  }
}

  const ultimos = await Gasto.find({ usuario: token._id}).sort({data:1}).limit(8)
 
  
    for (let cat of ultimos){
    dados= dados + cat.name + ',' + cat.categoria + ',' + cat.descrição + ',' + cat.local + ',' + cat.data + ',' + cat.valor + ','
  }

  res.render(__dirname + '/static/index.html', {gastos: valor,num:quant, entradas:valor_e,unidades:quant_e, dadosG:dados_g, dadosE:dados_e,nome:token.name})
}) 

app.get('/form', (req, res) => {
  res.render(__dirname + '/static/form.html')
}) 

app.get('/register', (req, res) => {
  res.render(__dirname + '/static/pages-sign-up.html')
}) 


app.get('/profile', async(req, res) => {

  const banco = await User.findOne({ '_id': token._id})
 let  dados = banco.name + ',' + banco.emprego + ',' + banco.email + ',' + banco.dividas + ',' + banco.investimentos + ',' + banco.renda 
  res.render(__dirname + '/static/pages-profile.html',{ aux: dados })
}) 

app.get('/dividas', async (req, res) => {

  let dados = []

  const banco = await Divida.find({ usuario: token._id}).sort({numero:1})

  for (let cat of banco){
    dados= dados + cat.name + ',' + cat.data + ',' + cat.valor + ',' + cat.devedor + ',' 
  }


  res.render(__dirname + '/views/divida.ejs',{aux:dados})
})

app.get('/devendo', async (req, res) => {

  let dados = []

  const banco = await Divida.find({ devedor: token.email}).sort({numero:1})

  for (let cat of banco){
    dados= dados + cat.name + ',' + cat.data + ',' + cat.valor + ',' + cat.devedor + ',' 
  }


  res.render(__dirname + '/views/devendo.ejs',{aux:dados})
})


app.get('/totalG', async (req, res) => {

  let dados = []
  const banco = await Gasto.find({ usuario: token._id}).sort({data:1})
 
  for (let cat of banco){
    dados= dados + cat.name + ',' + cat.categoria + ',' + cat.descrição + ',' + cat.local + ',' + cat.data + ',' + cat.valor + ','
  }
 
  res.render(__dirname + '/views/totalG.ejs', {auxiliar : dados})
})


app.get('/mes', async (req, res) => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed)
  let t =  new Date (today.toLocaleDateString('en-CA'))
  t.setDate(t.getDate() - (today.getDate() - 2))


  let dados = []
  const banco = await Gasto.find({ usuario: token._id , data : {$gte: t.toLocaleDateString('en-CA') }}).sort({data:1})
 
  for (let cat of banco){
    dados= dados + cat.name + ',' + cat.categoria + ',' + cat.descrição + ',' + cat.local + ',' + cat.data + ',' + cat.valor + ','
  }
 
  res.render(__dirname + '/views/mes.ejs', {auxiliar : dados})
}) 

app.get('/entradaMes', async (req, res) => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed)
  let t =  new Date (today.toLocaleDateString('en-CA'))
  t.setDate(t.getDate() - (today.getDate() - 2))

  let dados = []
  const banco = await Entrada.find({ usuario: token._id , data : {$gte: t.toLocaleDateString('en-CA') }}).sort({data:1})
 
  for (let cat of banco){
    dados= dados + cat.name + ',' + cat.categoria + ',' + cat.descrição + ',' + cat.local + ',' + cat.data + ',' + cat.valor + ','
  }
 
  res.render(__dirname + '/views/entradaMes.ejs', {auxiliar : dados})
}) 

app.get('/totalE', async (req, res) => {

  let dados = []
  const banco = await Entrada.find({ usuario: token._id }).sort({data:1})
 
  for (let cat of banco){
    dados= dados + cat.name + ',' + cat.categoria + ',' + cat.descrição + ',' + cat.local + ',' + cat.data + ',' + cat.valor + ','
  }
 
  res.render(__dirname + '/views/totalE.ejs', {auxiliar : dados})
}) 


app.get('/entrada', async (req, res) => {
  let dados_c = []
  let dados_d = []
  let dados_m = []
  let valor_categoria = []
  let valor_data = []
  let valor_mes = []
  let x =0

  const banco = await Entrada.find({ usuario: token._id}).sort({data:1})
 
  for (let cat of banco){
    
    if(valor_categoria.length>1){
      
      for(let i=0;i<valor_categoria.length;i=i+2){
        if(valor_categoria[i]==cat.categoria){
           x = cat.valor
           valor_categoria[i+1] = parseInt(valor_categoria[i+1]) + parseInt(cat.valor)
           dados_c = valor_categoria
        }
      }
      if(x==0){
      dados_c= dados_c + cat.categoria + ',' + cat.valor + ','
      valor_categoria = dados_c.split(",")
      }
      x=0;

    }else{
      dados_c= dados_c + cat.categoria + ',' + cat.valor + ','
      valor_categoria = dados_c.split(",")
    }
    
 }

  const timeElapsed = Date.now();
  const today = new Date(timeElapsed)
  let t =  new Date (today.toLocaleDateString('en-CA'))
  let hj = new Date (today.toLocaleDateString('en-CA'))
  t.setDate(t.getDate() - 7)
 
 for (let cat of banco){


  if(new Date(cat.data) >= t && new Date(cat.data) <= hj){
    let aux = cat.data[8] + cat.data[9] + '/' + cat.data[5] + cat.data[6]

    if(valor_data.length>1){
      
      for(let i=0;i<valor_data.length;i=i+2){
        if(valor_data[i]==aux){
           x = cat.valor
           valor_data[i+1] = parseInt(valor_data[i+1]) + parseInt(cat.valor)
           dados_d = valor_data
        }
      }
      if(x==0){
      dados_d= dados_d + aux + ',' + cat.valor + ','
      valor_data = dados_d.split(",")
      }
      x=0;
  
    }else{
      dados_d= dados_d + aux + ',' + cat.valor + ','
      valor_data = dados_d.split(",")
    }
  }
}

for (let cat of banco){

    let aux = cat.data[5] + cat.data[6]

    if(valor_mes.length>1){
      
      for(let i=0;i<valor_mes.length;i=i+2){
        if(valor_mes[i]==aux){
           x = cat.valor
           valor_mes[i+1] = parseInt(valor_mes[i+1]) + parseInt(cat.valor)
           dados_m = valor_mes
        }
      }
      if(x==0){
      dados_m= dados_m + aux + ',' + cat.valor + ','
      valor_mes = dados_m.split(",")
      }
      x=0;
  
    }else{
      dados_m= dados_m + aux + ',' + cat.valor + ','
      valor_mes = dados_m.split(",")
    } 
}
  
  valor_data.pop()
  valor_mes.pop()
  res.render(__dirname + '/views/entrada.ejs', {cat : valor_categoria , dat : valor_data, mes : valor_mes})
}) 

app.get('/metas',async (req, res) => {

  let dados = []
  let porcento

  const banco = await Meta.find({ usuario: token._id}).sort({numero:1})

  for (let cat of banco){
     porcento = (cat.atual / cat.total) *100
    dados= dados + cat.name + ',' + porcento + ','
  }

  res.render(__dirname + '/views/metas.ejs', {aux: dados})
}) 

//Cadastra novas entradas
app.get('/cadastroE', (req, res) => {
  res.render(__dirname + '/views/cadastroE.ejs')
}) 

//Cadastra novos gastos
app.get('/cadastro', (req, res) => {
  res.render(__dirname + '/static/plus.html')
}) 

//Cadastra novas metas
app.get('/cadastroM', (req, res) => {
  res.render(__dirname + '/views/cadastroM.ejs')
}) 

app.get('/gastos', async (req, res) => {
  
  let dados_c = []
  let dados_d = []
  let dados_m = []
  let valor_categoria = []
  let valor_data = []
  let valor_mes = []
  let x =0

  const banco = await Gasto.find({ usuario: token._id}).sort({data:1})
 
  for (let cat of banco){
    
    if(valor_categoria.length>1){
      
      for(let i=0;i<valor_categoria.length;i=i+2){
        if(valor_categoria[i]==cat.categoria){
           x = cat.valor
           valor_categoria[i+1] = parseInt(valor_categoria[i+1]) + parseInt(cat.valor)
           dados_c = valor_categoria
        }
      }
      if(x==0){
      dados_c= dados_c + cat.categoria + ',' + cat.valor + ','
      valor_categoria = dados_c.split(",")
      }
      x=0;

    }else{
      dados_c= dados_c + cat.categoria + ',' + cat.valor + ','
      valor_categoria = dados_c.split(",")
    }
    
 }

  const timeElapsed = Date.now();
  const today = new Date(timeElapsed)
  let t =  new Date (today.toLocaleDateString('en-CA'))
  t.setDate(t.getDate() - 7)
 
 for (let cat of banco){


  if(new Date(cat.data) >= t){
    let aux = cat.data[8] + cat.data[9] + '/' + cat.data[5] + cat.data[6]

    if(valor_data.length>1){
      
      for(let i=0;i<valor_data.length;i=i+2){
        if(valor_data[i]==aux){
           x = cat.valor
           valor_data[i+1] = parseInt(valor_data[i+1]) + parseInt(cat.valor)
           dados_d = valor_data
        }
      }
      if(x==0){
      dados_d= dados_d + aux + ',' + cat.valor + ','
      valor_data = dados_d.split(",")
      }
      x=0;
  
    }else{
      dados_d= dados_d + aux + ',' + cat.valor + ','
      valor_data = dados_d.split(",")
    }
  }
}

for (let cat of banco){

    let aux = cat.data[5] + cat.data[6]

    if(valor_mes.length>1){
      
      for(let i=0;i<valor_mes.length;i=i+2){
        if(valor_mes[i]==aux){
           x = cat.valor
           valor_mes[i+1] = parseInt(valor_mes[i+1]) + parseInt(cat.valor)
           dados_m = valor_mes
        }
      }
      if(x==0){
      dados_m= dados_m + aux + ',' + cat.valor + ','
      valor_mes = dados_m.split(",")
      }
      x=0;
  
    }else{
      dados_m= dados_m + aux + ',' + cat.valor + ','
      valor_mes = dados_m.split(",")
    } 
}
  


  valor_data.pop()
  valor_mes.pop()
  res.render(__dirname + '/views/gastos.ejs', {cat : valor_categoria , dat : valor_data, mes : valor_mes})
}) 


//Post's das paginas

//Cadastro novo gasto
app.post('/cadastro', async (req, res) => {
try{
  
  //Criar usuario
  const gasto = new Gasto({
    name: req.body.name,
    categoria: req.body.categoria,
    descrição: req.body.descrição,
    local: req.body.local,
    data: req.body.data,
    valor: req.body.valor,
    usuario:token._id,
})

  try{          
     await gasto.save()
}catch(error){
    console.log(error)
}

res.redirect('/home')
}catch(error){
  console.log(error)
} 
})

//Cadastro nova meta
app.post('/cadastroM', async (req, res) => {

  let x = 1
  const banco = await Meta.findOne({ usuario: token._id}).sort({numero: -1})

  if(banco){
    x = x + (+banco.numero)
  }

  try{
    
    //Criar usuario
    const meta = new Meta({
      name: req.body.name,
      total: req.body.valor,
      usuario:token._id,
      numero: x,
      atual: 0
  })
  
    try{          
       await meta.save()
  }catch(error){
      console.log(error)
  }
  
  res.redirect('/home')
  }catch(error){
    console.log(error)
  } 
  })

//Cadastro entrada
app.post('/cadastroE', async (req, res) => {
  try{
    
    //Criar usuario
    const entrada = new Entrada({
      name: req.body.name,
      categoria: req.body.categoria,
      descrição: req.body.descrição,
      local: req.body.local,
      data: req.body.data,
      valor: req.body.valor,
      usuario:token._id,
  })
  
    try{          
       await entrada.save()
  }catch(error){
      console.log(error)
  }
  
  res.redirect('/cadastroE')
  }catch(error){
    console.log(error)
  } 
  })

//Login
app.post('/', async (req, res) => {

    //Confere se o usuario ja existe
    const userExists = await User.findOne({ email: req.body.email})

    if(!userExists){ 
      return res.status(442).json(res.redirect('/'))       
    }

    //const salt = await  bcrypt.genSalt(10)
    // const hashedSenha = await bcrypt.hash(reg.body.senha, salt)
    const hashedSenha = req.body.password
    const senhaExist = await User.findOne({ password: hashedSenha})
    

    if(!senhaExist){ 
      return res.status(442).json(res.redirect('/'))       
    }

  
    token=userExists
  
    if(userExists.renda){
      res.redirect('/home')
    }else{
      res.redirect('/form')
    }
    
})

//Formulario
app.post('/form', async (req, res) => {

  try{          
     User.collection.replaceOne({ "_id":token._id } , {"name": token.name,
      "email": token.email,
      "password": token.password,
      "renda": req.body.renda,
      "gastos": req.body.gastos,
      "dividas": req.body.dividas,
      "saldo": req.body.saldo,
      "investimentos": req.body.investimentos,
      "emprego": req.body.emprego
     })
}catch(error){
    console.log(error)
}

res.redirect('/home')

})
 

//Registrar usuarios
app.post('/register', async (req, res) => {

  //Confere se o usuario ja existe
  const userExists = await User.findOne({ email: req.body.email})

  if(userExists){ 
    return res.status(442).json(res.redirect('/register'))       
  }

try{
    //const salt = await  bcrypt.genSalt(10)
    //const hashedSenha = await bcrypt.hash(reg.body.senha, salt)
    const hashedSenha = req.body.password

    //Criar usuario
    const users = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedSenha,
  })

    try{          
       await users.save()
  }catch(error){
      console.log(error)
  }

res.redirect('/')
}catch{
    res.redirect('/register')
}

})


app.post('/metas', async (req, res) => {


    const metas = await Meta.findOne({ name: req.body.nome})
    let x = +metas.atual + (+req.body.valor)
    x = x.toString()
    Meta.collection.updateOne({'name':req.body.nome},{$set:{'atual': x}},{multi:true})

  res.redirect('/metas')
  })


  app.post('/profile', async (req, res) => {


    User.collection.updateOne({'_id': token._id},{$set:{'emprego': req.body.emprego, 'email': req.body.email,
    'dividas': req.body.dividas, 'investimentos':req.body.investimentos, 'renda':req.body.renda
  }},{multi:true})

    res.redirect('/profile')
    })

  app.post('/dividas', async (req, res) => {

    let x = 1
    const banco = await Divida.findOne({ usuario: token._id}).sort({numero: -1})

  if(banco){
    x = x + (+banco.numero)
  }

  x = x.toString()
 
      //Criar usuario
      const dividas = new Divida({
        name: req.body.nome,
        data: req.body.data,
        valor: req.body.valor,
        devedor: req.body.devedor,
        usuario: token._id,
        numero: x
    })
       
    await dividas.save()
  
    res.redirect('/dividas')
    })



//Credencials
const dbUser = process.env.DB_USER
const dbPassaword = process.env.DB_PASS

//Conexão ao banco
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassaword}@cluster0.mn9vq0a.mongodb.net/test`,

).then(() => {
    app.listen(3000)
    console.log("Conectou ao banco")
}).catch((err) => console.log(err))
