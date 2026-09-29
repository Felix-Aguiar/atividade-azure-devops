// =====================================================
// APPLICATION INSIGHTS
// =====================================================
// O monitoramento nunca deve impedir a aplicação de subir.
try {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
        const appInsights = require('applicationinsights');

        appInsights
            .setup()
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true, true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setAutoCollectConsole(true, false)
            .start();

        console.log('Application Insights configurado com sucesso.');
    } else {
        console.log('APPLICATIONINSIGHTS_CONNECTION_STRING não configurada.');
    }
} catch (err) {
    console.error(
        'Application Insights apresentou erro, mas a aplicação continuará:',
        err.message
    );
}


// =====================================================
// DEPENDÊNCIAS
// =====================================================

const express = require('express');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 8080;


// =====================================================
// BANCO DE DADOS
// =====================================================

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,

    options: {
        encrypt: true,
        trustServerCertificate: false
    },

    connectionTimeout: 30000,
    requestTimeout: 30000
};


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        app: 'web-esportes-564154',
        timestamp: new Date().toISOString()
    });
});


// =====================================================
// PÁGINA INICIAL
// =====================================================

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>FIAP - Esportes & DevOps</title>

        <style>

            body {
                background-color: #1a1a1a;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

                margin: 0;
                height: 100vh;

                display: flex;
                align-items: center;
                justify-content: center;

                text-align: center;
            }

            .container {
                background-color: #262626;

                padding: 40px;

                border-radius: 12px;
                border-top: 5px solid #ED145B;

                box-shadow: 0 8px 16px rgba(0,0,0,0.5);

                max-width: 650px;
            }

            h1 {
                color: #ED145B;
            }

            p {
                color: #cccccc;
                font-size: 1.1em;
                line-height: 1.5;
            }

            .badge {
                display: inline-block;

                background-color: #4CAF50;

                padding: 6px 12px;

                border-radius: 5px;

                font-weight: bold;
            }

            .btn {
                display: inline-block;

                margin-top: 20px;

                padding: 12px 24px;

                background-color: #ED145B;
                color: white;

                text-decoration: none;

                border-radius: 6px;

                font-weight: bold;
            }

        </style>

    </head>

    <body>

        <div class="container">

            <div class="badge">
                Azure Deploy: Online
            </div>

            <h1>⚽ Esportes & Cloud</h1>

            <p>
                Aplicação Node.js integrada ao Azure SQL,
                GitHub Actions e Application Insights.
            </p>

            <a href="/tema" class="btn">
                Ver dados dos times
            </a>

        </div>

    </body>

    </html>
    `);
});


// =====================================================
// ROTA DO TEMA
// =====================================================

app.get('/tema', async (req, res) => {

    try {

        const pool = await sql.connect(dbConfig);

        const result = await pool
            .request()
            .query('SELECT * FROM Times');

        res.status(200).json(result.recordset);

    } catch (err) {

        console.error('Erro SQL:', err);

        res.status(500).json({
            erro: 'Não foi possível consultar o banco.',
            detalhe: err.message
        });
    }
});


// =====================================================
// START
// =====================================================

app.listen(port, '0.0.0.0', () => {

    console.log('=================================');
    console.log('Aplicação iniciada com sucesso');
    console.log(`Porta: ${port}`);
    console.log('=================================');

});
