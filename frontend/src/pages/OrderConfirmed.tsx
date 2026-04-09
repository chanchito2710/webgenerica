import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmed() {
  const location = useLocation();
  const orderId = (location.state as any)?.orderId;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido confirmado!</h1>
      {orderId && (
        <p className="text-gray-600 mb-2">
          Tu número de pedido es: <span className="font-bold text-primary">#{orderId}</span>
        </p>
      )}
      <p className="text-gray-500 mb-8">
        Te enviamos los detalles a tu email. Podés seguir el estado de tu pedido desde allí.
      </p>
      <Link to="/tienda" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-block">
        Seguir comprando
      </Link>
    </div>
  );
}
