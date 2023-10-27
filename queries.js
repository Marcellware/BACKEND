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

module.exports = {
    getUsers,
    verifyUserLoginCreds,
    buscarPorCodigo,
    getBienesConUsuariosYUbicacion,
    getTotalRegistros,
    getNotificaciones,
};
