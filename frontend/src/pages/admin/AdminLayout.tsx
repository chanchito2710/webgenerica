import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Settings, ChevronLeft, Home, Menu, X, Wrench, HelpCircle, Users, Tag, MapPin, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GuideOverlayProvider } from '../../context/GuideOverlayContext';
import GuideToolbar from '../../components/guide/GuideToolbar';
import GuideSpotlight from '../../components/guide/GuideSpotlight';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/inicio', icon: Home, label: 'Editar Inicio' },
  { to: '/admin/servicio', icon: Wrench, label: 'Editar Servicio' },
  { to: '/admin/faq', icon: HelpCircle, label: 'Editar FAQ' },
  { to: '/admin/nosotros', icon: Users, label: 'Editar Nosotros' },
  { to: '/admin/contacto', icon: MapPin, label: 'Editar Contacto' },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/categorias', icon: FolderTree, label: 'Categorías' },
  { to: '/admin/cupones', icon: Tag, label: 'Cupones' },
  { to: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
  { to: '/admin/ayuda', icon: BookOpen, label: 'Ayuda' },
];

export default function AdminLayout() {
  const { isAdmin, isSuperAdmin, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const navContent = (
    <>
      <div className="p-4 border-b border-gray-800 space-y-2">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ChevronLeft size={16} /> Volver a la tienda
        </Link>
        {isSuperAdmin && (
          <Link to="/super-admin" className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300">
            <Shield size={14} /> Super Admin
          </Link>
        )}
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-primary text-white' : 'hover:bg-gray-800 hover:text-white'}`}
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
    <GuideOverlayProvider>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-120px)]">
        {/* Mobile nav bar */}
        <div className="md:hidden bg-gray-900 text-gray-300 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Panel Admin</span>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-gray-400 hover:text-white">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 text-gray-300 border-t border-gray-800">
            {navContent}
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="w-56 bg-gray-900 text-gray-300 shrink-0 hidden md:block">
          {navContent}
        </aside>

        <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto">
          <GuideToolbar />
          <Outlet />
          <GuideSpotlight />
        </main>
      </div>
    </GuideOverlayProvider>
  );
}
