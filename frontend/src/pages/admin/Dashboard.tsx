import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function Dashboard() {
  const { config } = useSiteConfig();
  const currency = config?.currency || '$';
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      productService.getAllProducts({ limit: '1' }),
      orderService.getAllOrders({ limit: '1000' }),
    ]).then(([prodRes, ordRes]) => {
      const orders = ordRes.orders || [];
      const revenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
      setStats({ products: prodRes.total, orders: ordRes.total, revenue });
    });
  }, []);

  const cards = [
    { icon: Package, label: 'Productos', value: stats.products, color: 'bg-blue-500' },
    { icon: ShoppingCart, label: 'Pedidos', value: stats.orders, color: 'bg-green-500' },
    { icon: DollarSign, label: 'Ingresos', value: `${currency}${stats.revenue.toLocaleString()}`, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border p-6 flex items-center gap-4">
            <div className={`${c.color} p-3 rounded-lg`}>
              <c.icon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
