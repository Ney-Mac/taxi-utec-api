const jwt = require('jsonwebtoken');
const mysql = require('../bd/mysql');
const bcrypt = require('bcrypt');

const sendError = (res, code, message) => (
    res.status(code).send({
        error: message,
    })
);

const verifRequiredData = (body) => {
    let returnMessage = '';

    const required = [
        'email',
        'senha'
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

        const verif = verifRequiredData(req.body);
        if (verif) return sendError(res, 400, verif);

        conn.query(
            `SELECT * FROM usuarios WHERE email = ?`,
            [req.body.email],
            (error, result) => {
                conn.release();

                if (error) return sendError(res, 500, error);

                if (result.length < 1) return sendError(res, 401, 'Falha na autenticação');
                
                bcrypt.compare(req.body.senha, result[0].senha, (err, resultado) => {
                    if (err) return sendError(res, 401, 'Falha na autenticação');

                    if (resultado) {
                        const token = jwt.sign(
                            {
                                id_usuario: result[0].id_usuario
                            },
                            'palavra-secreta',
                            { expiresIn: '1h' }
                        );

                        return res.status(200).send({
                            message: 'Autenticado com sucesso',
                            user: {
                                id_usuario: result[0].id_usuario,
                                nome: result[0].nome,
                                email: result[0].email,
                                morada: result[0].morada,
                                data_nascimento: result[0].data_nascimento,
                                role: result[0].role,
                                nivel_pontualidade: result[0].nivel_pontualidade,
                                classificacao: result[0].classificacao,
                                km_andado: result[0].km_andado,
                                modo: result[0].modo,
                                token: token
                            }
                        });
                    }

                    return sendError(res, 401, 'Falha na autenticação');
                });
            }
        )
    });
};