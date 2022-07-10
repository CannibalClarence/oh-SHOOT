const router = require('express').Router();
const path = require('path');
const { User } = require("../models/user");



//  router.get('/', (req, res) =>
//     res.sendFile(path.join(__dirname, 'public/index.html'))
// ); 

router.get('/', (req, res) =>{

    User.findAll().then(

        res.render('home')
    )

})

router.get('/login', (req, res)=>{
    
    res.render('login')
})

module.exports = router;