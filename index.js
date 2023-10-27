// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 32767;
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


app.get('/notificaciones', db.getNotificaciones);





app.listen(port, '0.0.0.0', () => {
  console.log('Servidor en funcionamiento en el puerto:', port);
});


