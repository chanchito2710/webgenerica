import { useEffect, useState } from 'react';
import { Store, X, RefreshCw } from 'lucide-react';
import { getActiveTenantSlug, setActiveTenantSlug } from '../services/api';
import { superadminService } from '../services/superadmin.service';
import type { Tenant } from '../types';

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [current, setCurrent] = useState<string | null>(getActiveTenantSlug());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    superadminService
      .getTenants({ limit: '100' })
      .then((res) => setTenants(res.tenants))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (slug: string | null) => {
    setActiveTenantSlug(slug);
    setCurrent(slug);
    window.location.reload();
  };

  const currentName =
    tenants.find((t) => t.slug === current)?.name ?? current ?? 'Por dominio';

  return (
    <div className="p-3 border-t border-indigo-800">
      <div className="flex items-center gap-2 text-indigo-300 mb-2">
        <Store size={14} />
        <span className="text-xs font-semibold uppercase tracking-wide">Vista tenant</span>
      </div>

      <div className="flex items-center gap-1">
        <select
          value={current ?? ''}
          onChange={(e) => handleChange(e.target.value || null)}
          disabled={loading}
          className="flex-1 bg-indigo-900 text-indigo-100 text-xs rounded px-2 py-1.5 border border-indigo-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Por dominio (default)</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name} ({t.slug})
            </option>
          ))}
        </select>

        {current && (
          <button
            onClick={() => handleChange(null)}
            title="Limpiar override"
            className="p-1 text-indigo-400 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {current && (
        <p className="text-[10px] text-indigo-400 mt-1.5">
          Todas las peticiones usan tenant: <strong className="text-indigo-200">{currentName}</strong>
        </p>
      )}
    </div>
  );
}
