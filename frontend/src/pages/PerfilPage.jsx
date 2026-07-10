import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function PerfilPage() {
  const { usuario } = useAuth();
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <Layout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Mi perfil</h2>

      <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden max-w-2xl">
        <div className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
            {iniciales}
          </div>
          <div className="min-w-0">
            <p className="text-on-surface font-semibold text-lg truncate">{usuario?.nombre}</p>
            <p className="text-secondary text-sm truncate">{usuario?.email}</p>
            <span
              className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                usuario?.rol === 'admin' ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-secondary'
              }`}
            >
              {usuario?.rol === 'admin' ? 'Administrador' : 'Cuentas'}
            </span>
          </div>
        </div>
      </section>

      <CambiarPasswordSection />
    </Layout>
  );
}

function CambiarPasswordSection() {
  const [form, setForm] = useState({ passwordActual: '', passwordNueva: '', confirmar: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(false);

    if (form.passwordNueva !== form.confirmar) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (form.passwordNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
      });
      setForm({ passwordActual: '', passwordNueva: '', confirmar: '' });
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden max-w-2xl mt-6">
      <div className="px-6 py-5 border-b border-border-subtle">
        <h3 className="font-title-lg text-title-lg">Cambiar contraseña</h3>
        <p className="text-secondary text-body-sm">Cambia la contraseña de tu propia cuenta.</p>
      </div>
      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-status-error text-sm">{error}</p>}
        {exito && <p className="text-status-success text-sm">Contraseña actualizada correctamente.</p>}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-secondary block">Contraseña actual</label>
          <input
            type="password"
            required
            className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
            value={form.passwordActual}
            onChange={(e) => setForm({ ...form, passwordActual: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-secondary block">Nueva contraseña</label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
            value={form.passwordNueva}
            onChange={(e) => setForm({ ...form, passwordNueva: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-secondary block">Confirmar nueva contraseña</label>
          <input
            type="password"
            required
            className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
            value={form.confirmar}
            onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-action-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </section>
  );
}
