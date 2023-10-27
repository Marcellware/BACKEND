// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Usar el puerto proporcionado por Heroku o 3000 si se ejecuta localmente
const db = require('./queries');

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  console.log('Servidor en funcionamiento en el puerto:', port);
});


app.get('/buscarPorCodigo/:codigo', db.buscarPorCodigo);


app.get('/users', db.getUsers);


app.get('/verifyUser', db.verifyUserLoginCreds);


app.get('/bienesConUsuariosYUbicacion', db.getBienesConUsuariosYUbicacion);


app.get('/totalRegistros', db.getTotalRegistros);

app.get('/getBieNombrePorCodigo', db.getBieNombrePorCodigo);

app.get('/notificaciones', db.getNotificaciones);

app.get('/getSolicitudes', db.getSolicitudes);

app.post('/insertSolicitud', db.insertSolicitud);

app.listen(port,() => {
  console.log('Servidor en funcionamiento en el puerto:', port);
});

