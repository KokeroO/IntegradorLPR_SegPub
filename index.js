const { Curl, CurlFeature, CurlAuth, Easy, Multi } = require("node-libcurl");
const { StringDecoder } = require('node:string_decoder');
const randomHash = require('nanoid').customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 24)
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { spawn } = require('node:child_process');
const mysql = require('mysql2')
const appCams = require('./appCams')
const appIntegrateEntity = require('./appIntegrateEntity')
const prepareSQL = require('./prepare');
const requestImage = require("./requestImage");
const connection = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'base_lpr',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    supportBigNumbers: true,
});
const client = {}
client.libcurl = { Curl, CurlFeature, CurlAuth, Easy, Multi }
client.StringDecoder = StringDecoder
client.randomHash = randomHash
client.spawn = spawn
client.fs = fs
client.path = path
client.chalk = chalk
client.mysql = mysql
client.prepareSQL = prepareSQL
client.connection = connection

console.log(chalk.greenBright(`
 =>
 * Integrador LPR
 *
 * Integrador LPR estabelece uma conexão intermitente com câmeras
 * LPR, recolhe os eventos e possibilita a integração com orgãos de
 * segurança pública.
 *
 * Version - 2022.08.04
 <=`))



async function cams() {
    loopLPRs = setInterval(
        async () => {
            const [LPRs] = await connection.promise().execute(mysql.format(prepareSQL.prepared('config/lprActive'),
                [
                    1,
                    Math.floor((Date.now() / 1000) - 100)
                ]));
            if (LPRs.length > 0) {
                appCams.execute(client, LPRs)
                let cams = ''
                LPRs.forEach(function (LPR, index) {
                    cams = cams + `\n * ${LPR.identifier} | ${LPR.description} (IP: ${LPR.host} | Modelo: ${LPR.name_model})`
                })
                console.log(chalk.blueBright(`
 =>
 * INICIANDO${cams}
 <=`
                ))
            }
            return;
        }
        , 15000);
}

async function integraEntity() {
    const [configsIntegrationEntity] = await connection.promise().execute(prepareSQL.prepared('config/integrationEntityActives'))
    let integrateScript = ''
    configsIntegrationEntity.forEach(function (configIntegrationEntity, index) {
        integrateScript = integrateScript + `\n * ${configIntegrationEntity.name_integration_entity} ( ${configIntegrationEntity.url} )`
    })
    console.log(chalk.blueBright(`
 =>
 * INICIANDO INTEGRAÇÃO${integrateScript}
 <=`
    ))
    loopIntegrate = setInterval(
        async () => {
            for (const configIntegrationEntity of configsIntegrationEntity) {
                const [passagens] = await connection.promise().execute(mysql.format(prepareSQL.prepared('getTrafficIntegrationEntity'),
                    [
                        Math.floor((Date.now() / 1000)-300), 
                        configIntegrationEntity.script,
                        20
                    ]));
                if (passagens.length > 0) {
                    appIntegrateEntity.execute(client, configIntegrationEntity, passagens)
                }
            }
            return;
        }
        , 11000);
}

setTimeout(() => {
    requestImage.image(client)
    cams()
    integraEntity()
});