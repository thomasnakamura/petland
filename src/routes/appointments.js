var express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:employeeId', async (req, res) => {
        axios.get(`https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employee/${req.params.employeeId}/appointments`).then(response => {  
            res.json(response.data); 
        }).catch(error => {
            res.json(error);
        });
});

module.exports = router;