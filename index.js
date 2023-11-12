// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 32767; // 3000
const db = require('./queries');

const { obtenerIdCustodioPorNombre } = require('./queries');
const pool = require('./queries').pool;

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
app.get('/getSolicitudes', db.getSolicitudes);
app.post('/insertSolicitud', db.insertSolicitud);
app.get('/getBieNombrePorCodigo/:codigo', db.getBieNombrePorCodigo);
app.get('/getBienByCodigo/:codigo', db.getBienByCodigo);

app.get('/ubicaciones', db.getUbicaciones);
app.get('/custodios', db.getCustodios);

app.get('/codigoAsignacion/:nombre', db.codigoAsignacion);

app.get('/obtenerIdCustodioPorNombre/:nombre', obtenerIdCustodioPorNombre);

app.get('/actualizarEstadoBien/:codigo/:nuevoEstado', db.actualizarEstadoBien);

app.get('/actualizarUbicacionEnAsignacionBien/:codigo/:nuevaUbicacion', async (req, res) => {
  const codigo = req.params.codigo;
  const nuevaUbicacion = req.params.nuevaUbicacion;

  try {
      // Obtener el ID del bien basado en el código
      const result = await db.pool.query('SELECT bie_id FROM bien WHERE bie_codigo = $1', [codigo]);
      const bienId = result.rows[0].bie_id;

      // Actualizar la ubicación en la asignación del bien
      await db.pool.query('UPDATE asignacionBien SET asi_ubicacion = $1 WHERE asi_bien = $2', [nuevaUbicacion, bienId]);

      // Enviar una respuesta exitosa
      res.status(200).json({ message:`Actualización de ubicación para el bien ${codigo} a ${nuevaUbicacion} exitosa.`});
  } catch (error) {
      console.error('Error al actualizar ubicación:', error);
      res.status(500).json({ error: 'Error al actualizar ubicación.'});
  }
})


app.get('/actualizarCustodioEnAsignacionBien/:codigo/:nuevoCustodioId', async (req, res) => {
  const codigo = req.params.codigo;
  const nuevoCustodioId = req.params.nuevoCustodioId;

  try {
    // Obtener el ID del bien basado en el código
    const result = await db.pool.query('SELECT bie_id FROM bien WHERE bie_codigo = $1', [codigo]);
    const bienId = result.rows[0].bie_id;

    // Actualizar el custodio en la asignación del bien
    await db.pool.query('UPDATE asignacionBien SET asi_custodio = $1 WHERE asi_bien = $2', [nuevoCustodioId, bienId]);

    // Enviar una respuesta exitosa
    res.status(200).json({ message: `Actualización de custodio para el bien ${codigo} a ${nuevoCustodioId} exitosa.` });
  } catch (error) {
    console.error('Error al actualizar custodio:', error);
    res.status(500).json({ error: 'Error al actualizar custodio.' });
  }
});




app.listen(port, '0.0.0.0', () => {
  console.log('Servidor en funcionamiento en el puerto:', port);
});
