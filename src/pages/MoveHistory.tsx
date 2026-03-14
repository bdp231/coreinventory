import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MoveHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/operations/history', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        toast.error('Failed to fetch move history');
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Move History</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[780px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Operation</th>
                <th className="px-6 py-4 font-medium">Quantity Change</th>
                <th className="px-6 py-4 font-medium">Warehouse</th>
                <th className="px-6 py-4 font-medium">User</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.product?.name} ({item.product?.sku})</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.operationType === 'Receipt' ? 'bg-emerald-100 text-emerald-700' :
                      item.operationType === 'Delivery' ? 'bg-blue-100 text-blue-700' :
                      item.operationType === 'Transfer' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.operationType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className={item.quantityChange > 0 ? 'text-emerald-600' : item.quantityChange < 0 ? 'text-red-600' : 'text-slate-600'}>
                      {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.warehouse?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.user?.name}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No move history found.
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
