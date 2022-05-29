var express = require('express');
const axios = require('axios');
const router = express.Router();

const key = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees';

router.get('/', async (req, res) => {
    axios.get(key).then(response => { 
        res.json(response.data);
    }).catch(error => {
        res.json(error);
    });
});

module.exports = router;
