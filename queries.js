//queries.js

const Pool = require('pg').Pool;
/*

const pool = new Pool({
    host: 'localhost',
    database: 'usuariosUTM',
    port: '5432',
    user: 'postgres',
    password: '123456',
});
*/

const pool = new Pool({
    host: 'ec2-52-54-200-216.compute-1.amazonaws.com',
    database: 'd18epr74clhuo4',
    port: '5432',
    user: 'lozkouwwzynyji',
    password: '7f0d685bc56dabbbe20e3c603f8d848ff5ba805b8faec91660439dffbf6cbbc8',
    ssl: {
        rejectUnauthorized: false, // Esto evita errores por falta de CA en entornos de desarrollo
    },
});


const verifyUserLoginCreds = (request, response) => {
    pool.query('SELECT * FROM usuario WHERE usu_correo = $1 AND usu_contrasenia = $2', [request.query.email, request.query.pswd], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getUsers = (request, response) => {
    pool.query('SELECT * FROM usuario ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const buscarPorCodigo = (request, response) => {
    const { codigo } = request.params; // Obtener el código desde los parámetros de la URL

    pool.query(`
        SELECT
            b.bie_codigo,
            a.asi_ubicacion AS ubi_id,
            b.bie_nombre,
            b.bie_fechacreacion,
            CONCAT(u.usu_nombre, ' ', u.usu_apellido) AS nombre_completo
        FROM
            public.bien AS b
        JOIN
            public.asignacionbien AS a ON b.bie_id = a.asi_bien
        JOIN
            public.usuario AS u ON a.asi_custodio = u.usu_id
        WHERE
            b.bie_codigo = $1;
    `, [codigo], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};



const getBienesConUsuariosYUbicacion = (request, response) => {
    pool.query(`
        SELECT
            b.bie_codigo,
            a.asi_ubicacion AS ubi_id,
            b.bie_nombre,
            b.bie_fechacreacion,
            CONCAT(u.usu_nombre, ' ', u.usu_apellido) AS nombre_completo
        FROM
            public.bien AS b
        JOIN
            public.asignacionbien AS a ON b.bie_id = a.asi_bien
        JOIN
            public.usuario AS u ON a.asi_custodio = u.usu_id;
    `, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getTotalRegistros = (request, response) => {
    pool.query('SELECT COUNT(*) FROM bien', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows[0].count);
    });
};

const getNotificaciones = (request, response) => {
    pool.query(`
        SELECT solicitud.sol_id, solicitud.sol_descripcion, solicitud.sol_fecharealizacion, 
               CONCAT(usuario.usu_nombre, ' ', usuario.usu_apellido) AS nombre_usuario, 
               custodio.scc_destinatario
        FROM solicitud
        INNER JOIN solicitudcambiocustodio custodio ON solicitud.sol_id = custodio.scc_solicitudpadre
        INNER JOIN usuario ON custodio.scc_destinatario = usuario.usu_id;
    `, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

// Consulta de la tabla solicitud
const getSolicitudes = (request, response) => {
    pool.query(`
      SELECT
        sol.sol_id,
        sol.sol_tipo,
        sol.sol_descripcion,
        sol.sol_fecharealizacion AS fecha,
        sol.sol_estado AS estado,
        CONCAT(u.usu_nombre, ' ', u.usu_apellido) AS solicitante
      FROM
        solicitud sol
      INNER JOIN
        usuario u ON sol.sol_solicitante = u.usu_id
      INNER JOIN
        asignacionBien asi ON u.usu_id = asi.asi_custodio
      INNER JOIN
        ubicacion ubi ON asi.asi_ubicacion = ubi.ubi_id;
    `, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };
  
  // Inserción de solicitudes
  const insertSolicitud = (request, response) => {
    const { sol_tipo, sol_descripcion, sol_solicitante } = request.body; // Obtener los datos de la solicitud
  
    pool.query('INSERT INTO solicitud (sol_tipo, sol_descripcion, sol_solicitante) VALUES ($1, $2, $3) RETURNING sol_id', [sol_tipo, sol_descripcion, sol_solicitante], (error, result) => {
      if (error) {
        throw error;
      }
      response.status(201).json({ sol_id: result.rows[0].sol_id });
    });
  };
  
  const getBieNombrePorCodigo = (request, response) => {
    const { codigo } = request.params;
  
    pool.query('SELECT bie_nombre FROM bien WHERE bie_codigo = $1', [codigo], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };
  



  // Exportar las funciones
  module.exports = {
    getUsers,
    verifyUserLoginCreds,
    buscarPorCodigo,
    getBienesConUsuariosYUbicacion,
    getTotalRegistros,
    getNotificaciones,
    getSolicitudes, // Agregar la función de consulta de solicitudes
    insertSolicitud,
    getBieNombrePorCodigo, // Agregar la función de inserción de solicitudes
  };
  
