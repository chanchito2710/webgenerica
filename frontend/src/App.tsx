import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import Contact from './pages/Contact';
import ServicioTecnico from './pages/ServicioTecnico';
import OrderConfirmed from './pages/OrderConfirmed';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminConfig from './pages/admin/AdminConfig';
import AdminHome from './pages/admin/AdminHome';
import AdminServicioTecnico from './pages/admin/AdminServicioTecnico';
import AdminFAQ from './pages/admin/AdminFAQ';
import AdminAbout from './pages/admin/AdminAbout';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminContact from './pages/admin/AdminContact';
import FAQ from './pages/FAQ';
import AboutUs from './pages/AboutUs';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteConfigProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col bg-gray-50">
                <Routes>
                  <Route path="/admin/*" element={
                    <>
                      <Header />
                      <AdminLayout />
                      <Footer />
                    </>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="inicio" element={<AdminHome />} />
                    <Route path="servicio" element={<AdminServicioTecnico />} />
                    <Route path="faq" element={<AdminFAQ />} />
                    <Route path="nosotros" element={<AdminAbout />} />
                    <Route path="contacto" element={<AdminContact />} />
                    <Route path="cupones" element={<AdminCoupons />} />
                    <Route path="productos" element={<AdminProducts />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="pedidos" element={<AdminOrders />} />
                    <Route path="configuracion" element={<AdminConfig />} />
                  </Route>

                  <Route path="*" element={
                    <>
                      <Header />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/tienda" element={<Shop />} />
                          <Route path="/producto/:slug" element={<ProductDetail />} />
                          <Route path="/carrito" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/registro" element={<Register />} />
                          <Route path="/mis-pedidos" element={<MyOrders />} />
                          <Route path="/servicio-tecnico" element={<ServicioTecnico />} />
                          <Route path="/preguntas-frecuentes" element={<FAQ />} />
                          <Route path="/contacto" element={<Contact />} />
                          <Route path="/quienes-somos" element={<AboutUs />} />
                          <Route path="/orden-confirmada" element={<OrderConfirmed />} />
                        </Routes>
                      </main>
                      <Footer />
                      <WhatsAppButton />
                      <ScrollToTop />
                    </>
                  } />
                </Routes>
                <Toaster position="top-right" />
              </div>
            </CartProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </HelmetProvider>
  );
}
