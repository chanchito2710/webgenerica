import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, ChevronLeft, Menu, X, ScrollText, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TenantSwitcher from '../../components/TenantSwitcher';

const navItems = [
  { to: '/super-admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/super-admin/tenants', icon: Store, label: 'Tiendas' },
  { to: '/super-admin/admins', icon: Users, label: 'Administradores' },
  { to: '/super-admin/audit', icon: ScrollText, label: 'Auditoría' },
];

export default function SuperAdminLayout() {
  const { isSuperAdmin, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>;
  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const navContent = (
    <>
      <div className="p-4 border-b border-indigo-800">
        <div className="flex items-center gap-2 text-indigo-200 mb-2">
          <Shield size={18} />
          <span className="text-sm font-semibold text-white">Super Admin</span>
        </div>
        <Link to="/" className="flex items-center gap-2 text-xs text-indigo-300 hover:text-white">
          <ChevronLeft size={14} /> Ir al sitio
        </Link>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:hidden bg-indigo-950 text-indigo-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-white">Super Admin</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-indigo-300 hover:text-white">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-950 text-indigo-200 border-t border-indigo-800">
          {navContent}
        </div>
      )}

      <aside className="w-56 bg-indigo-950 text-indigo-200 shrink-0 hidden md:flex md:flex-col md:justify-between">
        <div>{navContent}</div>
        <TenantSwitcher />
      </aside>

      <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
