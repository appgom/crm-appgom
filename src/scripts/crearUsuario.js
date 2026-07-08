require('dotenv').config();
const crypto = require('crypto');
const pool = require('../config/db');
const usuarioModel = require('../models/usuarioModel');
const { hashPassword } = require('../services/authService');

function generarPasswordSegura() {
  return crypto.randomBytes(18).toString('base64url');
}

async function main() {
  const nombre = process.argv[2];
  const email = process.argv[3];

  if (!nombre || !email) {
    console.error('Uso: node src/scripts/crearUsuario.js "Nombre Apellido" correo@appgom.com');
    process.exitCode = 1;
    return;
  }

  const existente = await usuarioModel.findByEmail(email);
  if (existente) {
    console.error(`Ya existe un usuario con el correo ${email}. Usa el flujo de "cambiar contraseña" en vez de este script.`);
    process.exitCode = 1;
    return;
  }

  const password = generarPasswordSegura();
  const password_hash = await hashPassword(password);
  const usuario = await usuarioModel.create({ nombre, email, password_hash });

  console.log('Usuario creado:');
  console.log(`  Nombre: ${usuario.nombre}`);
  console.log(`  Email:  ${usuario.email}`);
  console.log(`  Contraseña (solo se muestra esta vez): ${password}`);
  console.log('Guárdala en un gestor de contraseñas y cámbiala después de tu primer inicio de sesión.');
}

main()
  .catch((err) => {
    console.error('Error creando usuario:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
