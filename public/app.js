import {createSector} from './sector.js';
const $ = id => document.getElementById(id);
// XAMPP serves the same client; Node serves the API on port 3000 locally.
const localHost = ['localhost','127.0.0.1','192.168.1.150'].includes(location.hostname);
const api = location.port === '3000' || !localHost ? '' : `${location.protocol}//${location.hostname}:3000`;
let mode = 'login';
let busy = false;
const sector = createSector(request);
$('enter-sector').addEventListener('click',() => sector.open());
async function request(path, body) {
  const response = await fetch(`${api}/api${path}`, {credentials:'include', ...(body === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
  const result = await response.json();
  if(!response.ok) { const error = new Error(result.error || 'No se pudo conectar.'); error.status = response.status; throw error; }
  return result;
}
function connected(user) {
  sector.close();
  $('auth-view').hidden = true; $('connected-view').hidden = false;
  $('player-name').textContent = user.username;
  $('teacher-link').hidden = !['teacher','admin'].includes(user.role);
  $('auth-form').reset(); $('message').textContent = '';
}
function switchMode(next) {
  if(busy) return;
  mode = next;
  const register = mode === 'register';
  $('login-tab').classList.toggle('active',!register); $('register-tab').classList.toggle('active',register);
  $('login-tab').setAttribute('aria-pressed',String(!register)); $('register-tab').setAttribute('aria-pressed',String(register));
  $('access-title').textContent = register ? 'Tu señal empieza aquí.' : 'Vuelve a la señal.';
  $('form-subtitle').textContent = register ? 'Elige tu alias. Encuentra a tu tripulación.' : 'Tu próximo punto de encuentro está aquí.';
  $('submit-label').textContent = register ? 'Crear mi credencial' : 'Conectar a la estación';
  $('confirm-field').hidden = !register; $('confirm').required = register;
  $('email-field').hidden = !register; $('email').required = register; $('email').disabled = !register;
  $('password-hint').hidden = !register;
  $('password').autocomplete = register ? 'new-password' : 'current-password';
  $('password').minLength = register ? 10 : 1;
  $('password').type = 'password'; $('toggle-password').textContent = 'Ver'; $('toggle-password').setAttribute('aria-label','Mostrar contraseña'); $('toggle-password').setAttribute('aria-pressed','false');
  $('auth-form').reset(); $('message').textContent = '';
}
$('login-tab').addEventListener('click',() => switchMode('login'));
$('register-tab').addEventListener('click',() => switchMode('register'));
$('toggle-password').addEventListener('click',() => {
  const show = $('password').type === 'password'; $('password').type = show ? 'text' : 'password';
  $('toggle-password').textContent = show ? 'Ocultar' : 'Ver'; $('toggle-password').setAttribute('aria-label',show ? 'Ocultar contraseña' : 'Mostrar contraseña'); $('toggle-password').setAttribute('aria-pressed',String(show));
});
$('auth-form').addEventListener('submit',async event => {
  event.preventDefault(); if(busy) return;
  const password = $('password').value;
  if(new TextEncoder().encode(password).length > 72) { $('message').textContent = 'Tu contraseña es demasiado larga. Prueba una más corta o usa menos símbolos.'; return; }
  if(mode === 'register' && password !== $('confirm').value) {$('message').textContent = 'Las contraseñas no coinciden.'; $('confirm').focus(); return;}
  busy = true; $('submit-button').disabled = true; $('message').textContent = 'Estableciendo enlace…';
  try {const result = await request(`/auth/${mode}`,{username:$('username').value,password,...(mode === 'register' ? {email:$('email').value.trim()} : {})}); connected(result.user);}
  catch(error) {$('message').textContent = error instanceof TypeError ? 'No hay conexión con la estación. Comprueba que el servidor esté encendido.' : error.message;}
  finally {busy = false; $('submit-button').disabled = false;}
});
$('logout').addEventListener('click',async () => {
  $('logout').disabled = true;
  try {await request('/auth/logout',{}); sector.close(); $('connected-view').hidden = true; $('auth-view').hidden = false; $('session-message').textContent = ''; switchMode('login'); $('username').focus();}
  catch { $('session-message').textContent = 'No se pudo cerrar sesión. Intenta de nuevo.'; }
  finally {$('logout').disabled = false;}
});
request('/auth/me').then(result => connected(result.user)).catch(error => {
  if(error.status !== 401) $('message').textContent = 'No hay conexión con la estación. Comprueba que el servidor esté encendido.';
});
