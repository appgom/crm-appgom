const { Pool } = require('pg');

// El usuario de la app no siempre es owner de la base (ej. hosting
// administrado), asi que ALTER DATABASE ... SET TIME ZONE no siempre es
// una opcion. Pasarlo como parametro de arranque de la conexion (estilo
// psql -c) lo fija antes de que corra cualquier query, sin permisos
// especiales, para que now()/CURRENT_DATE y cualquier TIMESTAMPTZ se
// interpreten siempre en hora de Mexico.
const TIMEZONE_OPTIONS = '-c TimeZone=America/Mexico_City';

// Render (y la mayoria de proveedores en la nube) exponen una sola
// DATABASE_URL con SSL requerido. En local seguimos usando las variables
// sueltas contra el Postgres de Docker, que no necesita SSL.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      options: TIMEZONE_OPTIONS,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      options: TIMEZONE_OPTIONS,
    });

module.exports = pool;
