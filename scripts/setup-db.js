import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

// The administrator password is accepted through the environment, never logged.
const admin = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_ADMIN_USER || 'root', password: process.env.DB_ADMIN_PASSWORD || '', multipleStatements: false });
const name = process.env.DB_NAME;
if (!/^[a-zA-Z0-9_]+$/.test(name || '')) throw new Error('DB_NAME inválido');
try {
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.query(`USE \`${name}\``);
  await admin.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
  const [done] = await admin.execute('SELECT name FROM schema_migrations WHERE name = ?', ['001_initial']);
  if (!done.length) {
    const [tables] = await admin.query('SHOW TABLES');
    if (tables.length !== 1) throw new Error('La base contiene tablas sin historial de migración. No se modificará su esquema.');
    const sql = await readFile(new URL('../database/001_initial.sql', import.meta.url), 'utf8');
    for (const statement of sql.replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean)) await admin.query(statement);
    await admin.execute('INSERT INTO schema_migrations (name) VALUES (?)', ['001_initial']);
  }
  const [emailMigration] = await admin.execute('SELECT name FROM schema_migrations WHERE name = ?', ['002_player_email']);
  if (!emailMigration.length) {
    const sql = await readFile(new URL('../database/002_player_email.sql', import.meta.url), 'utf8');
    for (const statement of sql.replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean)) await admin.query(statement);
    await admin.execute('INSERT INTO schema_migrations (name) VALUES (?)', ['002_player_email']);
  }
  const [sectorMigration] = await admin.execute('SELECT name FROM schema_migrations WHERE name = ?', ['003_sector_one']);
  if (!sectorMigration.length) {
    const sql = await readFile(new URL('../database/003_sector_one.sql', import.meta.url), 'utf8');
    for (const statement of sql.replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean)) await admin.query(statement);
    await admin.execute('INSERT INTO schema_migrations (name) VALUES (?)', ['003_sector_one']);
  }
  const [teacherMigration] = await admin.execute('SELECT name FROM schema_migrations WHERE name = ?', ['004_teacher_requests']);
  if (!teacherMigration.length) {
    const sql = await readFile(new URL('../database/004_teacher_requests.sql', import.meta.url), 'utf8');
    for (const statement of sql.replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean)) await admin.query(statement);
    await admin.execute('INSERT INTO schema_migrations (name) VALUES (?)', ['004_teacher_requests']);
  }
  const [inviteMigration]=await admin.execute('SELECT name FROM schema_migrations WHERE name=?',['005_group_invites']);
  if(!inviteMigration.length){const sql=await readFile(new URL('../database/005_group_invites.sql',import.meta.url),'utf8');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await admin.query(statement);await admin.execute('INSERT INTO schema_migrations (name) VALUES (?)',['005_group_invites']);}
  if (process.env.DB_USER === 'root') {
    if (process.env.NODE_ENV !== 'development' || process.env.DB_ALLOW_LOCAL_ROOT !== 'true') throw new Error('Root solo se admite como excepción local explícita');
    console.log(`Base ${name} preparada. Excepción root local activa; permisos mínimos pendientes.`);
    process.exitCode = 0;
  } else {
  if (!process.env.DB_PASSWORD) throw new Error('Define DB_PASSWORD para la cuenta de la aplicación');
  await admin.query('CREATE USER IF NOT EXISTS ?@\'127.0.0.1\' IDENTIFIED BY ?', [process.env.DB_USER, process.env.DB_PASSWORD]);
  await admin.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${name}\`.* TO ?@'127.0.0.1'`, [process.env.DB_USER]);
  console.log(`Base ${name} preparada. Migración 001_initial aplicada/verificada.`);
  }
} catch (error) {
  console.error('No se pudo preparar la base:', error.code || error.message);
  process.exitCode = 1;
} finally { await admin.end(); }
