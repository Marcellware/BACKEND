//queries.js

const Pool = require('pg').Pool;
const queries = require('./queries');

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

const executeQuery = async (query, values) => {
  try {
      const result = await pool.query(query, values);
      return result.rows;
  } catch (error) {
      throw error;
  }
};


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
    const { sol_tipo, sol_descripcion, sol_solicitante } = request.body;

    // Verifica si sol_tipo y sol_solicitante son números enteros válidos
    if (!Number.isInteger(sol_tipo) || !Number.isInteger(sol_solicitante)) {
        response.status(400).json({ error: 'sol_tipo y sol_solicitante deben ser números enteros válidos' });
        return;
    }

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
  

  const getBienByCodigo = (request, response) => {
    const { codigo } = request.params;
  
    pool.query(
      `
      SELECT bie_codigo, bie_nombre, ubi_nombre, CONCAT(u.usu_nombre, ' ', u.usu_apellido) AS custodio, bie_estado
      FROM Bien b  
      INNER JOIN asignacionbien asi ON b.bie_id = asi.asi_bien
      INNER JOIN ubicacion ubi ON asi.asi_ubicacion = ubi.ubi_id
      INNER JOIN usuario u ON asi.asi_custodio = u.usu_id
      WHERE bie_codigo = $1;
      `,
      [codigo],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  };
  
  // Consulta para obtener ubicaciones
  const getUbicaciones = (request, response) => {
    pool.query('SELECT ubi_nombre FROM ubicacion', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };
  
  const getCustodios = (request, response) => {
    pool.query(`SELECT CONCAT(usu_nombre, ' ', usu_apellido) AS usuario FROM usuario`, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };



  const codigoAsignacion = (request, response) => {
    const { nombre } = request.params;
  
    const query = `
      SELECT asi_ubicacion
      FROM Bien b  
      INNER JOIN asignacionbien asi ON b.bie_id = asi.asi_bien
      INNER JOIN ubicacion ubi ON asi.asi_ubicacion = ubi.ubi_id
      WHERE ubi_nombre = $1;
    `;
  
    pool.query(query, [nombre], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };


  const obtenerIdCustodioPorNombre = (request, response) => {
    const { nombre } = request.params;
  
    const query = `
      SELECT usu_id
      FROM usuario
      WHERE CONCAT(usu_nombre, ' ', usu_apellido) = $1
      GROUP BY 1
      LIMIT 1;
    `;
  
    pool.query(query, [nombre], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };


  const actualizarEstadoBien = (request, response) => {
    const { codigo, nuevoEstado } = request.params;

    pool.query('UPDATE public.bien SET bie_estado = $1 WHERE bie_codigo = $2', [nuevoEstado, codigo], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
  };


  const actualizarUbicacionEnAsignacionBien = (request, response) => {
    const { codigo, nuevaUbicacionId } = request.params;
  
    pool.query(
      `
      UPDATE public.asignacionBien AS ab
      SET asi_ubicacion = $1
      FROM public.bien AS b
      WHERE b.bie_codigo = $2
      AND ab.asi_bien = b.bie_id;
      `,
      [nuevaUbicacionId, codigo],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  };

  const actualizarCustodioEnAsignacionBien = (request, response) => {
    const { codigo, nuevoCustodioId } = request.params;
  
    pool.query(
      `
      UPDATE public.asignacionBien AS ab
      SET asi_custodio = $1
      FROM public.bien AS b
      WHERE b.bie_codigo = $2
      AND ab.asi_bien = b.bie_id;
      `,
      [nuevoCustodioId, codigo],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  };







  
  module.exports = {
    pool: pool,
    getUsers,
    executeQuery,
    verifyUserLoginCreds,
    buscarPorCodigo,
    getBienesConUsuariosYUbicacion,
    getTotalRegistros,
    getNotificaciones,
    getSolicitudes,
    insertSolicitud,
    getBieNombrePorCodigo,
    getBienByCodigo,
    getUbicaciones,
    getCustodios,
    codigoAsignacion,
    obtenerIdCustodioPorNombre,
    actualizarEstadoBien,
    actualizarUbicacionEnAsignacionBien,
    actualizarCustodioEnAsignacionBien,
    
    
  };
  
  // Para evidenciar las consultas
  // curl -X GET http://localhost:32767/actualizarUbicacionEnAsignacionBien/1034602/3
