const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('../bd/mysql');

const sendError = (res, code, message) => (
    res.status(code).send({
        error: message,
    })
);

const verifRequiredData = (body, res) => {
    let returnMessage = '';

    const required = [
        'nome',
        'email',
        'senha',
        'morada',
        'data_nascimento',
        'role',
        'modo'
    ];

    required.forEach(data => {
        if (!body[data]) {
            returnMessage = `${data} não foi enviado`;
        }
    });

    return returnMessage;
}

module.exports = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return sendError(res, 500, error);

        const verif = verifRequiredData(req.body, res);
        if (verif) {
            return sendError(res, 400, verif);
        };

        conn.query(
            `SELECT * FROM usuarios WHERE email = ?`,
            [req.body.email],
            (error, result) => {
                conn.release();

                if (error) return sendError(res, 500, error);

                if (result.length > 0) return sendError(res, 409, 'Usuario já cadastrado');
                else {
                    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                        if (errBcrypt) return sendError(res, 500, errBcrypt);

                        conn.query(
                            `INSERT INTO usuarios(
                                nome, 
                                email, 
                                senha,
                                morada,
                                data_nascimento,
                                role,
                                modo
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                                req.body.nome,
                                req.body.email,
                                hash,
                                req.body.morada,
                                req.body.data_nascimento,
                                req.body.role,
                                req.body.modo
                            ],
                            (error, result) => {
                                conn.release();
                                if (error) return sendError(res, 500, error);

                                const response = {
                                    message: 'Usuário criado com sucesso',
                                    user: {
                                        id: result.insertId,
                                        nome: req.body.nome,
                                        email: req.body.email,
                                        morada: req.body.morada,
                                        data_nascimento: req.body.data_nascimento,
                                        role: req.body.role,
                                        modo: req.body.modo,
                                        token: hash
                                    }
                                }

                                res.status(201).send(response);
                            }
                        )
                    })
                }

            }
        );
    })
}