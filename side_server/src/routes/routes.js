const router = require('express').Router()
const mysqlConnection = require('../loaders/mysql')

const SelectRouteService = require('../services/SelectRouteService')

const selectRouteService = new SelectRouteService(mysqlConnection)


const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require('../middleware/auth');

const SELECT_ALBUMS = "SELECT * FROM album"
const SELECT_ARTISTE = "SELECT * FROM artiste"
const SELECT_CHANSON = "SELECT * FROM chanson"

router.get('/api/albums', (req, res) => {
    selectRouteService.getQuery(SELECT_ALBUMS, res)
})

router.get('/api/artiste', (req, res) => {
    selectRouteService.getQuery(SELECT_ARTISTE, res)
})

router.get('/api/chanson', (req, res) => {
    selectRouteService.getQuery(SELECT_CHANSON, res)
})

// Exemple : /api/readChanson/55
router.get('/api/readChanson/:id', (req, res) => {
    const idChanson = req.params.id
    const selectChansonFromIdChanson = `SELECT * FROM chanson WHERE codeChanson = '${idChanson}'`
    
    try {
        mysqlConnection.query(selectChansonFromIdChanson, (err, result) => {
            if(result.map(elm => elm.codeChanson).toString() === "")
                return res.status(400).json({msg: "Error !"})
            else {
                res.status(200).send(result)
            }
        })
    } catch(err) {
        console.log(err)
        res.status(500).send("Error !")
    }
})

router.post('/api/noter', (req, res) => {
    const { codeChanson, identifiantC, note } = req.body

    const InsertNoteByCodeAndIdentifiant = `INSERT INTO noter (codeChanson, identifiantC, note) VALUES ('${codeChanson}', '${identifiantC}', '${note}')`
    const SelectChansonByNoteAVG = `SELECT COUNT(note) as count, SUM(note) as note FROM noter WHERE codeChanson = '${codeChanson}'`

    mysqlConnection.query(InsertNoteByCodeAndIdentifiant, err => {
        mysqlConnection.query(SelectChansonByNoteAVG, (err, resultAVG) => {
            let newValue = ( resultAVG.map(elm => elm.note).toString() + 5 ) / (resultAVG.map(elm => elm.count).toString() + 1)
            const UdpateNoteForChanson = `UPDATE chanson SET noteOpinionC = '${newValue}' WHERE codeChanson = '${codeChanson}'`
            mysqlConnection.query(UdpateNoteForChanson, err => {console.log("Update Do !")})
        })
    })
})

router.post('/api/contact', (req, res) => {
    const { identifiantC, optionC, messageC, dateC } = req.body
    const InsertContactClient = `INSERT INTO contact (identifiantC, optionC, messageC, dateC) VALUES ('${identifiantC}', '${optionC}', '${messageC}', '${dateC}')`

    mysqlConnection.query(InsertContactClient, err => console.log('Your message is send !'))
})

router.get('/api/artisteChanson/:id', (req, res) => {
    const numArtiste = req.params.id
    const selectChansonFromNumArtiste = `SELECT * FROM chanson WHERE numA = '${numArtiste}'`

    mysqlConnection.query(selectChansonFromNumArtiste, (err, result) => {
        res.status(200).send(result)
    })
})

// Register
/*
{
    "nomC": "testnom",
    "dateDeNaissance": "2020-12-20",
    "emailC": "test@abc.fr",
    "identifiantC": "aze",
    "motDePasseC": "abcd123",
    "prenomC": "test"
}
*/
router.post('/api/register', 
    [
        check("emailC", "Please enter a valid email").isEmail(),
        check("motDePasseC", "Please enter a valid password").isLength({ min: 6 })
    ], 
    (req, res) => {
        const errors = validationResult(req)
        const { nomC, dateDeNaissance, emailC, identifiantC, motDePasseC, prenomC } = req.body
        const selectEmailCheck = `SELECT emailC FROM comptemusical WHERE emailC = '${emailC}'`

        if (!errors.isEmpty()) 
            return res.status(400).json({ errors: errors.array() })

        try {
            mysqlConnection.query(selectEmailCheck, async (err, result) => {
                if (result.map(elm => elm.emailC).toString() !== "") 
                    return res.status(400).json({msg: "Compte already exist"})  
                else {
                    const salt = await bcrypt.genSalt(10)
                    const passwordHash = await bcrypt.hash(motDePasseC, salt)
                    const sqlInsertCompte = `INSERT INTO comptemusical (nomC, dateDeNaissance, emailC, identifiantC, motDePasseC, prenomC) VALUES ('${nomC}', '${dateDeNaissance}', '${emailC}', '${identifiantC}', '${passwordHash}', '${prenomC}')`
                    mysqlConnection.query(sqlInsertCompte, (err) => {console.log('Insert Compte Musical')})

                    const payload = { user: {
                        emailC: emailC
                    }}

                    jwt.sign( payload, "randomString", { expiresIn: 10000}, (err, token) => {
                        if (err) throw err
                        res.status(200).json({token})
                    } )
                }
            })
        } catch (err) {
            console.log(err)
            res.status(500).send("Error in Saving !")
        }
    }
)

// Login 
/*
{
    "emailC": "lolae@or.fr",
    "motDePasseC": "abcd123"
}
*/
router.post('/api/login', 
    [
        check("emailC", "Please enter a valid email").isEmail(),
        check("motDePasseC", "Please enter a valid password").isLength({ min: 6 })
    ], 
    (req, res) => {
        const errors = validationResult(req);
        const {emailC, motDePasseC} = req.body
        const selectEmailCheck = `SELECT * FROM comptemusical WHERE emailC = '${emailC}'`

        if (!errors.isEmpty()) 
            return res.status(400).json({ errors: errors.array() })

        try {
            mysqlConnection.query(selectEmailCheck, async (err, result) => {
                if (result.map(elm => elm.emailC).toString() !== emailC) 
                    return res.status(400).json({msg: "Compte not exist"})  
                else {
                    const isMatch = await bcrypt.compare(motDePasseC, result.map(elm => elm.motDePasseC).toString())
                    if(!isMatch)
                        return res.status(400).json({message: "Incorrect Password !"})

                    const payload = { user: {
                        emailC: emailC
                    }}

                    jwt.sign( payload, "randomString", { expiresIn: 3600 }, (err, token) => {
                        if(err) throw err
                        res.status(200).json({ token })
                    })
                }
            })
        } catch(err) {
            console.error(err)
            res.status(500).json({message: "Server Error"})
        } 
    }
)

router.get('/api/me', auth, async (req, res) => {
    try {
        mysqlConnection.query(`SELECT * FROM comptemusical WHERE emailC='${req.user.emailC}'`, (err, result) => {res.status(200).send(result)})
    } catch(e) {
        res.send({message: "Error in Fetching user"})
    }
})


module.exports = router 