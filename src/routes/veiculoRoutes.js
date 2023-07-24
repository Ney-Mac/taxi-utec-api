const express = require('express');
const mysql = require('../bd/mysql');

const route = express.Router();

const sendError = (res, code, message) => (
    res.status(code).send({
        error: message,
    })
);

const verifRequiredData = (body) => {
    let returnMessage = '';

    const required = [
        'id_usuario',
        'tipo',
        'fiabilidade'
    ];

    required.forEach(data => {
        if (!body[data]) {
            returnMessage = `${data} não foi enviado`;
        }
    });

    return returnMessage;
}

route.post('/register', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return sendError(res, 500, error);

        const verif = verifRequiredData(req.body);
        if (verif) return sendError(res, 400, verif);

        mysql.query(
            `SELECT * FROM usuarios WHERE id_usuario = ?`,
            [req.body.id_usuario],
            (error, result) => {
                conn.release();

                if (error) return sendError(res, 500, error);

                if (result.length < 1) return sendError(res, 401, new Error('Id inválido'));

                conn.query(
                    `INSERT INTO veiculo(tipo, preco_base, fiabilidade, id_usuario) VALUES(?, ?, ?, ?)`,
                    [
                        req.body.tipo,
                        req.body.preco_base,
                        req.body.fiabilidade,
                        req.body.id_usuario
                    ],
                    (error, result) => {
                        conn.release();
                        if (error) return sendError(res, 500, error);

                        const response = {
                            message: 'Veiculo adicionado com sucesso',
                            data: {
                                id_veiculo: result.insertId,
                                id_usuario: req.body.id_usuario,
                                preco_base: req.body.preco_base,
                                fiabilidade: req.body.fiabilidade,
                                tipo: req.body.tipo
                            }
                        }

                        return res.status(201).send(response);
                    }
                )
            }
        )
    });
})

module.exports = route;