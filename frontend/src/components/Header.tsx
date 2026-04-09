import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, LayoutDashboard, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { assetUrl } from '../services/api';
import CartDrawer from './CartDrawer';
import LiveSearch from './LiveSearch';
import { SOCIAL_ICON_MAP } from './SocialIcons';

export default function Header() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { totalItems } = useCart();
  const { config } = useSiteConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const socialEntries = config?.socialLinks && typeof config.socialLinks === 'object'
    ? Object.entries(config.socialLinks).filter(([, v]) => String(v).trim())
    : [];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="bg-primary text-white text-xs sm:text-sm py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {config?.phone && (
              <a href={`tel:${config.phone}`} className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <Phone size={13} /> <span className="hidden sm:inline">{config.phone}</span>
              </a>
            )}
            {config?.email && (
              <a href={`mailto:${config.email}`} className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <Mail size={13} /> <span className="hidden sm:inline">{config.email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {socialEntries.map(([key, val]) => {
              const url = String(val);
              const SIcon = SOCIAL_ICON_MAP[key.toLowerCase()];
              if (!SIcon) return null;
              return (
                <a key={key} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors" title={key}>
                  <SIcon size={15} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="shrink-0">
            {config?.logo ? (
              <img src={assetUrl(config.logo)} alt={config.siteName || 'Logo'} className="h-10 sm:h-12 max-w-[180px] object-contain" />
            ) : (
              <span className="text-2xl font-bold text-primary">{config?.siteName || 'WebGenerica'}</span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Inicio</Link>
            <Link to="/tienda" className="text-gray-700 hover:text-primary transition-colors">Tienda</Link>
            <Link to="/servicio-tecnico" className="text-gray-700 hover:text-primary transition-colors">Servicio técnico</Link>
            <Link to="/preguntas-frecuentes" className="text-gray-700 hover:text-primary transition-colors">FAQ</Link>
            <Link to="/quienes-somos" className="text-gray-700 hover:text-primary transition-colors">Nosotros</Link>
            <Link to="/contacto" className="text-gray-700 hover:text-primary transition-colors">Contacto</Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-600 hover:text-primary transition-colors">
              <Search size={20} />
            </button>

            <button onClick={() => setCartOpen(true)} className="p-2 text-gray-600 hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <User size={20} />
                  <span className="hidden md:inline text-sm">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-2 min-w-[180px] z-50">
                    {isSuperAdmin && (
                      <Link to="/super-admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 font-medium">
                        <LayoutDashboard size={16} /> Super Admin
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={16} /> Panel Admin
                      </Link>
                    )}
                    <Link to="/mis-pedidos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <ShoppingCart size={16} /> Mis Pedidos
                    </Link>
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full text-left">
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 text-gray-600 hover:text-primary transition-colors">
                <User size={20} />
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <LiveSearch onClose={() => setSearchOpen(false)} />
        )}

        {menuOpen && (
          <div className="md:hidden mt-3 border-t pt-3 flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Inicio</Link>
            <Link to="/tienda" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Tienda</Link>
            <Link to="/servicio-tecnico" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Servicio técnico</Link>
            <Link to="/preguntas-frecuentes" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">FAQ</Link>
            <Link to="/quienes-somos" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Nosotros</Link>
            <Link to="/contacto" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Contacto</Link>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
