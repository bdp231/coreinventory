import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowRightLeft,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg">
        <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
        <p className="text-sm text-slate-600">Product: <span className="font-medium">{data.product}</span></p>
        <p className="text-sm text-slate-600">Operation: <span className="font-medium">{data.operation}</span></p>
        <p className="text-sm text-slate-600">Change: <span className={`font-medium ${data.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{data.quantityChange > 0 ? '+' : ''}{data.quantityChange}</span></p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      }
    };
    fetchDashboard();
  }, [user]);

  if (!data) return <div className="p-8">Loading dashboard...</div>;

  const cards = [
    { title: 'Total Products', value: data.totalProducts, icon: Package, color: 'bg-blue-500' },
    { title: 'Low Stock Items', value: data.lowStockItems, icon: AlertTriangle, color: 'bg-amber-500' },
    { title: 'Out of Stock', value: data.outOfStock, icon: XCircle, color: 'bg-red-500' },
    { title: 'Pending Receipts', value: data.pendingReceipts, icon: ArrowDownToLine, color: 'bg-emerald-500' },
    { title: 'Pending Deliveries', value: data.pendingDeliveries, icon: ArrowUpFromLine, color: 'bg-indigo-500' },
    { title: 'Internal Transfers', value: data.internalTransfers, icon: ArrowRightLeft, color: 'bg-purple-500' },
  ];

  const chartData = data.recentActivity
    ? [...data.recentActivity].reverse().map((activity: any) => ({
        date: format(new Date(activity.timestamp), 'MMM d, HH:mm'),
        product: activity.product?.name || 'Unknown',
        operation: activity.operationType,
        quantityChange: activity.quantityChange,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {data.lowStockAlerts && data.lowStockAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900">Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.lowStockAlerts.map((alert: any) => (
              <div key={alert._id} className="bg-white border border-amber-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-900">{alert.name}</p>
                  <p className="text-xs text-slate-500">SKU: {alert.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${alert.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {alert.stock} left
                  </p>
                  <p className="text-xs text-slate-500">Reorder at {alert.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Stock Activity</h2>
        <div className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="quantityChange" 
                  name="Quantity Change"
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No recent activity found.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Products by Stock</h2>
          <div className="h-[300px] w-full">
            {data.topProducts && data.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No products found.</div>
            )}
          </div>
        </div>

        {/* Operations Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Operations Breakdown</h2>
          <div className="h-[300px] w-full">
            {data.operationsBreakdown && data.operationsBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.operationsBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.operationsBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No operations found.</div>
            )}
          </div>
        </div>

        {/* Stock by Warehouse */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Stock by Warehouse</h2>
          <div className="h-[300px] w-full">
            {data.stockByWarehouse && data.stockByWarehouse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stockByWarehouse} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="totalStock" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No warehouse data found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Receipts & Deliveries */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Receipts & Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Operation</th>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.pendingOperationsList && data.pendingOperationsList.length > 0 ? (
                data.pendingOperationsList.map((op: any) => (
                  <tr key={op._id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 text-sm text-slate-600">
                      {format(new Date(op.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        op.type === 'Receipt' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {op.type}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-slate-900">
                      {op.product?.name || 'Unknown'}
                    </td>
                    <td className="py-3 text-sm font-medium text-slate-600">
                      {op.quantity}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500 text-sm">
                    No pending receipts or deliveries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
