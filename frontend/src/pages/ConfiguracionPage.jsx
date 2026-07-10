import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from './ClientesPage';
import { api } from '../api/client';

export default function ConfiguracionPage() {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'usuarios' && usuario?.rol === 'admin' ? 'usuarios' : 'catalogo';
  function setTab(nuevoTab) {
    setSearchParams(nuevoTab === 'catalogo' ? {} : { tab: nuevoTab });
  }
  const [servicios, setServicios] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function cargar() {
    api.get('/catalogo-servicios').then(setServicios).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregarServicio(e) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    try {
      await api.post('/catalogo-servicios', { nombre: nuevoNombre.trim() });
      setNuevoNombre('');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActivo(servicio) {
    try {
      await api.put(`/catalogo-servicios/${servicio.id}`, { nombre: servicio.nombre, activo: !servicio.activo });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Configuración</h2>

      <div className="flex items-center gap-2 border-b border-border-subtle mb-6 max-w-2xl">
        <button
          onClick={() => setTab('catalogo')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === 'catalogo' ? 'border-action-blue text-action-blue' : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Catálogo de servicios
        </button>
        {usuario?.rol === 'admin' && (
          <button
            onClick={() => setTab('usuarios')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'usuarios' ? 'border-action-blue text-action-blue' : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            Usuarios
          </button>
        )}
      </div>

      {tab === 'catalogo' && (
        <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden max-w-2xl">
          <div className="px-6 py-5 border-b border-border-subtle">
            <h3 className="font-title-lg text-title-lg">Catálogo de servicios</h3>
            <p className="text-secondary text-body-sm">Los tipos de servicio disponibles al crear un contrato.</p>
          </div>

          {error && <p className="text-status-error px-6 pt-4 text-sm">{error}</p>}

          <form className="p-6 flex gap-3 border-b border-border-subtle" onSubmit={agregarServicio}>
            <input
              className="flex-1 bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              placeholder="Nombre del nuevo servicio"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
            <button type="submit" className="bg-action-blue text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary transition-all">
              Agregar
            </button>
          </form>

          <div className="divide-y divide-border-subtle">
            {loading && <p className="p-6 text-secondary">Cargando...</p>}
            {!loading && servicios.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-3">
                <span className={s.activo ? 'text-on-surface' : 'text-secondary line-through'}>{s.nombre}</span>
                <button
                  onClick={() => toggleActivo(s)}
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    s.activo ? 'bg-status-success/15 text-status-success' : 'bg-surface-container text-secondary'
                  }`}
                >
                  {s.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'usuarios' && usuario?.rol === 'admin' && <UsuariosSection />}
    </Layout>
  );
}

function UsuariosSection() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [passwordGenerada, setPasswordGenerada] = useState(null);

  function cargar() {
    setLoading(true);
    api.get('/usuarios').then(setUsuarios).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarEliminar() {
    try {
      await api.delete(`/usuarios/${eliminando.id}`);
      setEliminando(null);
      cargar();
    } catch (err) {
      setError(err.message);
      setEliminando(null);
    }
  }

  async function resetearPassword(u) {
    setError(null);
    try {
      const { passwordTemporal } = await api.post(`/usuarios/${u.id}/reset-password`, {});
      setPasswordGenerada({ nombre: u.nombre, email: u.email, passwordTemporal });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden max-w-2xl">
      <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between gap-3">
        <div>
          <h3 className="font-title-lg text-title-lg">Gestión de usuarios</h3>
          <p className="text-secondary text-body-sm">Quién puede entrar al sistema y con qué permisos.</p>
        </div>
        <button
          onClick={() => setCreando(true)}
          className="bg-action-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary transition-all shrink-0"
        >
          Nuevo usuario
        </button>
      </div>

      {error && <p className="text-status-error px-6 pt-4 text-sm">{error}</p>}

      <div className="divide-y divide-border-subtle">
        {loading && <p className="p-6 text-secondary">Cargando...</p>}
        {!loading && usuarios.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 px-6 py-3">
            <div className="min-w-0">
              <p className="text-on-surface font-semibold truncate">{u.nombre}</p>
              <p className="text-secondary text-sm truncate">{u.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  u.rol === 'admin' ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-secondary'
                }`}
              >
                {u.rol === 'admin' ? 'Administrador' : 'Cuentas'}
              </span>
              <button
                title="Editar"
                className="p-1.5 text-secondary hover:text-action-blue hover:bg-surface-container-low rounded"
                onClick={() => setEditando(u)}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                title="Restablecer contraseña"
                className="p-1.5 text-secondary hover:text-action-blue hover:bg-surface-container-low rounded"
                onClick={() => resetearPassword(u)}
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
              </button>
              {u.id !== usuarioActual.id && (
                <button
                  title="Eliminar"
                  className="p-1.5 text-secondary hover:text-status-error hover:bg-status-error/10 rounded"
                  onClick={() => setEliminando(u)}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(creando || editando) && (
        <UsuarioFormModal
          usuario={editando}
          onClose={() => {
            setCreando(false);
            setEditando(null);
          }}
          onSaved={(passwordTemporal) => {
            setCreando(false);
            setEditando(null);
            cargar();
            if (passwordTemporal) setPasswordGenerada({ passwordTemporal });
          }}
        />
      )}

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar usuario"
          mensaje={`¿Seguro que quieres eliminar a "${eliminando.nombre}"? Perderá acceso al sistema de inmediato.`}
          onCancel={() => setEliminando(null)}
          onConfirm={confirmarEliminar}
        />
      )}

      {passwordGenerada && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">Contraseña temporal</h3>
            <p className="text-secondary text-sm">
              Cópiala y compártela de forma segura. No se volverá a mostrar.
            </p>
            <div className="bg-surface-base border border-border-subtle rounded-lg px-4 py-3 font-mono-label text-on-surface text-center select-all">
              {passwordGenerada.passwordTemporal}
            </div>
            <button
              className="w-full px-4 py-3 bg-action-blue text-white rounded-lg font-bold hover:scale-[1.02] transition-all"
              onClick={() => setPasswordGenerada(null)}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function UsuarioFormModal({ usuario, onClose, onSaved }) {
  const esEdicion = Boolean(usuario);
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    rol: usuario?.rol || 'cuentas',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (esEdicion) {
        await api.put(`/usuarios/${usuario.id}`, { nombre: form.nombre, rol: form.rol });
        onSaved(null);
      } else {
        const nuevo = await api.post('/usuarios', form);
        onSaved(nuevo.passwordTemporal);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </h3>
          <button className="p-2 hover:bg-surface-base rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Nombre</label>
            <input
              required
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Correo</label>
            <input
              type="email"
              required
              disabled={esEdicion}
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue disabled:opacity-60"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Rol</label>
            <select
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="admin">Administrador (acceso total)</option>
              <option value="cuentas">Cuentas (no puede eliminar registros ni administrar usuarios)</option>
            </select>
          </div>
          {!esEdicion && (
            <p className="text-xs text-text-muted">
              Se generará una contraseña temporal que se mostrará una sola vez al guardar.
            </p>
          )}
          <div className="flex gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-action-blue text-white rounded-lg font-bold hover:scale-[1.02] transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
