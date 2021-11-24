const cookieParser = require("cookie-parser");
const express = require("express");
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID='YOUR_CLIENT_ID'
const client = new OAuth2Client(CLIENT_ID);



const app= express();
const PORT = process.env.PORT || 5500;


app.set('view engine','ejs');

app.use(express.json());

app.use(cookieParser()); 


app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login',(req,res)=>{
    let token =req.body.token;
    console.log(token);

    async function verify() {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    console.log(payload)
  }
  verify().then(()=>{
      res.cookie('session-token',token);
      res.send('success');
  }).catch(console.error);

})

app.get('/dashboard', checkAuthenticated,  (req, res)=>{
    let user = req.user;
    res.render('dashboard', {user});
})

app.get('/index', (req, res)=>{
    
    res.render('index');
})


app.get('/secret', checkAuthenticated, (req,res)=>{
    res.render('secret')
})

app.get('/logout', (req, res)=>{
    res.clearCookie('session-token');
    res.redirect('/login')

})


function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}


app.listen(PORT,()=>{
    console.log(`Server Started on ${PORT}` );
})
