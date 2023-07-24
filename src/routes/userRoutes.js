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
        'id_veiculo'
    ];

    required.forEach(data => {
        if (!body[data]) {
            returnMessage = `${data} não foi enviado`;
        }
    });

    return returnMessage;
}

route.patch('/mudar-modo', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return sendError(res, 500, error);

        if (!req.body.id_usuario) return sendError(res, 400, new Error('id_usuario não foi enviado'));

        conn.query(
            `UPDATE usuarios SET modo = ? WHERE id_usuario = ?`,
            [req.body.modo, req.body.id_usuario],
            (error, result) => {
                conn.release();
                if (error) return sendError(res, 500, error);

                return res.status(200).send({
                    message: 'Estado alterado com sucesso',
                    modo: req.body.modo
                });
            }
        );
    });
});

route.patch('/tornar-motorista', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return sendError(res, 500, error);

        const verif = verifRequiredData(req.body);
        if (verif) return sendError(res, 400, verif);

        conn.query(
            `UPDATE veiculo SET id_usuario = ? WHERE id_veiculo = ?`,
            [req.body.id_usuario, req.body.id_veiculo],
            (error, result) => {
                conn.release();
                if (error) return sendError(res, 500, error);

                return res.status(200).send({
                    message: 'Motorista criado com sucesso',
                    data: {
                        id_usuario: req.body.id_usuario,
                        id_veiculo: req.body.id_veiculo
                    }
                });
            }
        );
    });
});

module.exports = route;