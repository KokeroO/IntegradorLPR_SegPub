module.exports = {
    async execute(client, configIntegrateEntity, passagens) {
        if (passagens.length < 1) {
            console.log(client.chalk.redBright(`
            =>
            * Não encontradas novas passagens
            <=`))
            return;
        }
        const multi = new client.libcurl.Multi()
        const handles = []
        const handlesData = []
        let finished = 0

        if (configIntegrateEntity.script == "SESP_PR_CELEPAR") {
            passagens.forEach(function (passagem, index) {
                const payload = JSON.stringify({
                    placa: passagem.plate,
                    dataRegistro: new Date(passagem.utc * 1000).toLocaleString('pt-BR', { hour12: false, timeZone: "America/Sao_Paulo" }),
                    velocidade: passagem.speed,
                    latitude: passagem.latitude,
                    longitude: passagem.longitude,
                    grauFidelidade: "79",
                    arquivo: client.fs.readFileSync(`vehicles/${passagem.plate}/${passagem.image}`, "base64")
                });
                const handle = new client.libcurl.Easy()
                handle.setOpt('URL', configIntegrateEntity.url)
                handle.setOpt("POST", true)
                handle.setOpt("POSTFIELDS", payload)
                handle.setOpt("SSL_VERIFYSTATUS", false)
                handle.setOpt("SSL_VERIFYPEER", false)
                handle.setOpt("SSL_VERIFYHOST", false)
                handle.setOpt("TIMEOUT", 10)
                handle.setOpt('WRITEFUNCTION', callbackSESP)
                handle.setOpt("HEADER", 0)
                handle.setOpt("HTTPHEADER", [
                    "Content-Type: application/json",
                    `Authorization: ${configIntegrateEntity.token}`,
                    `identificadorCameraEmpresa:${passagem.identify}`
                ])

                handlesData.push([[parseInt(passagem.traffic_junctionid), passagem.plate, new Date(passagem.utc * 1000).toLocaleString('pt-BR', { hour12: false, timeZone: "America/Sao_Paulo" }), passagem.identify], []])
                handles.push(handle)
                multi.addHandle(handle)
            })

            function callbackSESP(data, n, nmemb) {
                const key = handles.indexOf(this)
                handlesData[key][1].push(data)
                return n * nmemb
            }

            multi.onMessage((error, handle, errorCode) => {
                const key = handles.indexOf(handle)
                const responseCode = handle.getInfo('RESPONSE_CODE').data
                let responseData = handlesData[key][1].toString()
                switch (responseCode) {
                    case 201:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integrate_entity'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        console.log(client.chalk.whiteBright(`
     =>
     * ENVIADO A ${client.chalk.underline.bold(configIntegrateEntity.name_integrate_entity)} ( ${handlesData[key][0][3]} | ${handlesData[key][0][1]} | ${handlesData[key][0][2]} )
     <=`
                        ))
                        break;
                    case 400:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Alguma informação (dado inválido, tamanho, tipo, obrigatoriedade) não foi antendida.',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                    case 401:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Token de integração inválido.',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                    case 403:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Identificador do equipamento desativado ou inválido.',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                    case 404:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Veículo não encontrado.',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                    case 0:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Não foi possível estabelecer a conexão.',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                }

                multi.removeHandle(handle)
                handle.close()

                if (++finished === passagens.length) {
                    multi.close()
                    return;
                }

            })
        }

        if (configIntegrateEntity.script == "PRF_SPIA_AB_3.0") {
            passagens.forEach(function (passagem, index) {
                const payload = JSON.stringify({
                    placa: passagem.plate,
                    tipoveiculo: passagem.category,
                    velocidade: passagem.speed,
                    dataHora: new Date(passagem.utc * 1000).toLocaleString('en-CA', { hour12: false, timeZone: "America/Sao_Paulo" }).replace(",", ""),
                    idImagem: passagem.image,
                    camera: {
                        numero: passagem.identify,
                        latitude: passagem.latitude,
                        longitude: passagem.longitude
                    },
                    empresa: configIntegrateEntity.identity,
                    key: configIntegrateEntity.token,
                });
                const handle = new client.libcurl.Easy()
                handle.setOpt('URL', configIntegrateEntity.url)
                handle.setOpt("POST", true)
                handle.setOpt("POSTFIELDS", payload)
                handle.setOpt("SSL_VERIFYSTATUS", false)
                handle.setOpt("SSL_VERIFYPEER", false)
                handle.setOpt("SSL_VERIFYHOST", false)
                handle.setOpt("TIMEOUT", 10)
                handle.setOpt('WRITEFUNCTION', callbackPRF)
                handle.setOpt("HEADER", 0)
                handle.setOpt("HTTPHEADER", [
                    "Content-Type: application/json",
                    "User-Agent: #Spia#"
                ])

                handlesData.push([[parseInt(passagem.traffic_junctionid), passagem.placa, new Date(passagem.utc * 1000).toLocaleString('pt-BR', { hour12: false, timeZone: "America/Sao_Paulo" }), passagem.identificador], []])
                handles.push(handle)
                multi.addHandle(handle)
            })

            function callbackPRF(data, n, nmemb) {
                const key = handles.indexOf(this)
                handlesData[key][1].push(data)
                return n * nmemb
            }

            multi.onMessage((error, handle, errorCode) => {
                const key = handles.indexOf(handle)
                const responseCode = handle.getInfo('RESPONSE_CODE').data
                switch (responseCode) {
                    case 200:
                        let responseData = handlesData[key][1].toString()
                        responseData = JSON.parse(responseData)
                        switch (responseData.codigo) {
                            case 0:
                                client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity'),
                                    {
                                        'traffic_junctionid': handlesData[key][0][0],
                                        'script': configIntegrateEntity.script,
                                        'date_created': Math.floor(Date.now() / 1000)
                                    }
                                ));
                                console.log(client.chalk.whiteBright(`
     =>
     * ENVIADO A ${client.chalk.underline.bold(configIntegrateEntity.name_integrate_entity)} ( ${handlesData[key][0][3]} | ${handlesData[key][0][1]} | ${handlesData[key][0][2]} )
     <=`
                                ))
                                break;
                            case 1:
                                client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                                    {
                                        'traffic_junctionid': handlesData[key][0][0],
                                        'message': responseData.Mensagem,
                                        'script': configIntegrateEntity.script,
                                        'date_created': Math.floor(Date.now() / 1000)
                                    }
                                ));
                                break;
                            case 2:
                                client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                                    {
                                        'traffic_junctionid': handlesData[key][0][0],
                                        'message': responseData.Mensagem,
                                        'script': configIntegrateEntity.script,
                                        'date_created': Math.floor(Date.now() / 1000)
                                    }
                                ));
                                break;
                            case 3:
                                client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                                    {
                                        'traffic_junctionid': handlesData[key][0][0],
                                        'message': responseData.Mensagem,
                                        'script': configIntegrateEntity.script,
                                        'date_created': Math.floor(Date.now() / 1000)
                                    }
                                ));
                                break;
                        }
                        break;
                    case 404:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Erro 404: URL não encontrada',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                    case 0:
                        client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_integration_entity_logs'),
                            {
                                'traffic_junctionid': handlesData[key][0][0],
                                'message': 'Não foi possível estabelecer a conexão.',
                                'script': configIntegrateEntity.script,
                                'date_created': Math.floor(Date.now() / 1000)
                            }
                        ));
                        break;
                }

                multi.removeHandle(handle)
                handle.close()

                if (++finished === passagens.length) {
                    multi.close()
                    return;
                }

            })
        }
    }
}