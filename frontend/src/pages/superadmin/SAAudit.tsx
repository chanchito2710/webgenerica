import { useEffect, useState } from 'react';
import { superadminService } from '../../services/superadmin.service';
import type { AuditLog } from '../../types';

const actionLabels: Record<string, string> = {
  create_admin: 'Crear admin',
  suspend_admin: 'Suspender admin',
  reactivate_admin: 'Reactivar admin',
  delete_admin: 'Eliminar admin',
  suspend_tenant: 'Suspender tienda',
  reactivate_tenant: 'Reactivar tienda',
  delete_tenant: 'Eliminar tienda',
};

export default function SAAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    superadminService.getAuditLogs({ page: String(page), limit: '50' })
      .then((res) => { setLogs(res.logs); setPages(res.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const formatDate = (d: string) => new Date(d).toLocaleString('es');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registro de auditoría</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Acción</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Entidad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.entity}</td>
                    <td className="px-4 py-3 text-gray-500">{log.entityId ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No hay registros</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Anterior</button>
              <span className="px-3 py-1 text-sm text-gray-500">Página {page} de {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
