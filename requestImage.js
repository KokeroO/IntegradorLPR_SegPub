module.exports = {
    async image(client) {
        var express = require('express');
        var app = express();
        app.use(express.json())
        app.post('/captureCams*', function (req, res) {
            (async () => {
                try {
                    const [token] = await client.connection.promise().query(mysql.format(client.prepareSQL.prepared('validToken'), [req.query.mun]));
                    if (token.length == 0) {
                        const retorno = {
                            retorno: 'Token inválido.'
                        };
                        res.status(401).json(retorno);
                        return;
                    }
                    const [image] = await client.connection.promise().query(mysql.format(client.prepareSQL.prepared('getPass'), [req.body.idImage]));
                    if (image.length == 1) {
                        const passagem = {
                            idImage: image[0].image,
                            imagem: client.fs.readFileSync(`vehicles/${image[0].placa}/${image[0].image}`, "base64"),
                            retorno: 'OK'
                        };
                        res.status(200).json(passagem);
                    } else if (image.length > 1) {
                        const passagem = {
                            retorno: 'Inconsistência de dados.'
                        };
                        res.status(200).json(passagem);
                    } else {
                        const passagem = {
                            retorno: 'Imagem não encontrada.'
                        };
                        res.status(200).json(passagem);
                    }
                }
                finally {
                    return;
                }
            }
            )()

        });

        app.use(function(req, res, next) {
            res.status(404).redirect(307, 'http://www.google.com.br/');
          });

        app.listen(8080, function () {
            
        });
    }

}