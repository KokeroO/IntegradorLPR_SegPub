

#  IntegradorLPR_SegPub
_Integrador LPR_

## Descrição

Integrador LPR estabelece uma conexão intermitente com câmeras LPR da Intelbras, recolhe os eventos traffic_junction como placa, cor, velocidade e entre outras variáveis, assim possibilita a integração com órgãos de segurança pública.

O projeto inicialmente foi desenvolvido por mim em **PHP** para suprir a necessidade do meu município em integrar cameras LPR Intelbras com órgãos de seguração pública como **SESP_PR_CELEPAR** e **PRF_SPIA_AB_3.0**, mas tive a iniciativa de refaze-lo em **NodeJS**. 

Apesar de funcional, não é um projeto para produção. Estou disponibilizo o projeto para ser usado como exemplo de comunicação com os equipamentos. Utilizei de exemplo os equipamentos `VIP 7325 LPR version: >= Aug 21 2019` e `VIP 93200 LPR IA FT version: >= Feb 26 2021` no projeto e que funcionou por mais de 2 anos sem problemas.

O software faz uma conexão via **CURL** utilizando a opção `WRITEFUNCTION` do `CURL_EASY` com os equipamento LPRs, salva as informaçãos sobre a passagem do veículo em um banco de dados `MySQL/MariaDB` e a imagem na pasta `vehicles`. A conexão é intermitente, após qualquer desconexão é feita uma nova tentativa de reconexão com o equipamento.

As informações sobre as passagens do veículo são processadas em uma fila e enviado os dados para outra API juntamente com o `base64` da imagem. Alguns orgão podem solicitar a imagem novamente através de uma requisição. O link para download da imagem é disponibilizado através da `lib Express.js`.

## Documentação

###### **Requisitos**

- NodeJS >= v12;
- Banco de Dados MySQL/MariaDB;

###### **Instalação**

1. Baixe a Release do [**IntegradorLPR_SegPub**](https://github.com/KokeroO/IntegradorLPR_SegPub/releases);
2. Importe o arquivo `base.sql` para sua base de dados;
3. Instale as dependecias: `npm install`;
4. Vá para `index.js` e configura os dados do banco.
5. Execute: `node index.js`

###### **Configurações adicionais**

Utilizei o banco de dados para salvar constantes e paramêtros de comunicação dos equipamentos:
- A tabela `config_system` possui a coluna `token` que é utilizado para autorizar a consulta da imagem pela url: [http://[HOST]/captureCams];
- A tabela `config_lpr_intelbras` contém os parametros de comunicação e dados que podem ser enviados a outros órgãos;
- A tabela `config_integration_entity` contém os dados para execução e paramêtros de comunicação com outras API.

## Creditos e contato
**Não remova os créditos do autor.**

**KokeroO - Discord: Kokero#3996**

## License

Consulte [LICENSE.md](./LICENSE.md).