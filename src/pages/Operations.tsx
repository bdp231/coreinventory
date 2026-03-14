import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';

interface OperationsProps {
  type: 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment';
  title: string;
}

export default function Operations({ type, title }: OperationsProps) {
  const { user } = useAuth();
  const [operations, setOperations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    product: '', quantity: 0, supplierName: '', customerName: '',
    fromWarehouse: '', toWarehouse: '', systemQuantity: 0, countedQuantity: 0, warehouse: ''
  });

  const fetchOperations = async () => {
    try {
      const res = await fetch(`/api/operations?type=${type}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch operations');
      }
      setOperations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to fetch operations');
      setOperations([]);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [prodRes, whRes] = await Promise.all([
        fetch('/api/products', { headers: { Authorization: `Bearer ${user?.token}` } }),
        fetch('/api/warehouses', { headers: { Authorization: `Bearer ${user?.token}` } })
      ]);

      const productsData = await prodRes.json();
      const warehousesData = await whRes.json();

      if (!prodRes.ok) {
        throw new Error(productsData?.message || 'Failed to fetch products');
      }
      if (!whRes.ok) {
        throw new Error(warehousesData?.message || 'Failed to fetch warehouses');
      }

      setProducts(Array.isArray(productsData) ? productsData : []);
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to fetch dependencies');
      setProducts([]);
      setWarehouses([]);
    }
  };

  useEffect(() => {
    fetchOperations();
    fetchDependencies();
  }, [user, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ ...formData, type }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create operation');
      }
      
      toast.success(`${type} created successfully`);
      setIsModalOpen(false);
      setFormData({
        product: '', quantity: 0, supplierName: '', customerName: '',
        fromWarehouse: '', toWarehouse: '', systemQuantity: 0, countedQuantity: 0, warehouse: ''
      });
      fetchOperations();
    } catch (error: any) {
      const message = typeof error === 'string' ? error : error?.message || 'Something went wrong';
      toast.error(message);
    }
  };

  const handleValidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to validate this operation? This will update stock.')) return;
    try {
      const res = await fetch(`/api/operations/${id}/validate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to validate operation');
      }
      toast.success('Operation validated');
      fetchOperations();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleProductChange = (productId: string) => {
    setFormData({
      ...formData,
      product: productId,
      warehouse: '',
      fromWarehouse: '',
      systemQuantity: 0
    });
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const product = products.find(p => p._id === formData.product);
    const stockEntry = product?.stockByWarehouse?.find((s: any) => s.warehouse._id === warehouseId);
    setFormData({
      ...formData,
      warehouse: warehouseId,
      systemQuantity: stockEntry ? stockEntry.stock : 0
    });
  };

  const handleFromWarehouseChange = (warehouseId: string) => {
    const product = products.find(p => p._id === formData.product);
    const stockEntry = product?.stockByWarehouse?.find((s: any) => s.warehouse._id === warehouseId);
    setFormData({
      ...formData,
      fromWarehouse: warehouseId,
      systemQuantity: stockEntry ? stockEntry.stock : 0
    });
  };

  const selectedProduct = products.find(p => p._id === formData.product);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New {type}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Product</th>
                {type !== 'Transfer' && <th className="px-6 py-4 font-medium">Warehouse</th>}
                {type === 'Receipt' && <th className="px-6 py-4 font-medium">Supplier</th>}
                {type === 'Delivery' && <th className="px-6 py-4 font-medium">Customer</th>}
                {type === 'Transfer' && (
                  <>
                    <th className="px-6 py-4 font-medium">From</th>
                    <th className="px-6 py-4 font-medium">To</th>
                  </>
                )}
                {type === 'Adjustment' && (
                  <>
                    <th className="px-6 py-4 font-medium">System Qty</th>
                    <th className="px-6 py-4 font-medium">Counted Qty</th>
                  </>
                )}
                {type !== 'Adjustment' && <th className="px-6 py-4 font-medium">Quantity</th>}
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr key={op._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{
                    isValid(new Date(op.date)) ? format(new Date(op.date), 'MMM d, yyyy') : '-'
                  }</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{op.product?.name || 'Unknown product'}</td>
                  {type !== 'Transfer' && <td className="px-6 py-4 text-sm text-slate-500">{op.warehouse?.name}</td>}
                  {type === 'Receipt' && <td className="px-6 py-4 text-sm text-slate-500">{op.supplierName}</td>}
                  {type === 'Delivery' && <td className="px-6 py-4 text-sm text-slate-500">{op.customerName}</td>}
                  {type === 'Transfer' && (
                    <>
                      <td className="px-6 py-4 text-sm text-slate-500">{op.fromWarehouse?.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{op.toWarehouse?.name}</td>
                    </>
                  )}
                  {type === 'Adjustment' && (
                    <>
                      <td className="px-6 py-4 text-sm text-slate-500">{op.systemQuantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{op.countedQuantity}</td>
                    </>
                  )}
                  {type !== 'Adjustment' && <td className="px-6 py-4 text-sm text-slate-500">{op.quantity}</td>}
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      op.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {op.status === 'Draft' && (
                      <button
                        onClick={() => handleValidate(op._id)}
                        className="text-emerald-600 hover:text-emerald-800 flex items-center justify-end gap-1 w-full"
                      >
                        <CheckCircle className="w-4 h-4" /> Validate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New {type}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Product</label>
                <select required value={formData.product} onChange={e => handleProductChange(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.totalStock || 0} in total stock)</option>
                  ))}
                </select>
              </div>

              {type !== 'Transfer' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Warehouse</label>
                  <select required value={formData.warehouse} onChange={e => handleWarehouseChange(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {type === 'Receipt' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Supplier Name</label>
                    <input required type="text" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quantity to Receive</label>
                    <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </>
              )}

              {type === 'Delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Customer Name</label>
                    <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quantity to Deliver</label>
                    <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </>
              )}

              {type === 'Transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">From Warehouse</label>
                    <select required value={formData.fromWarehouse} onChange={e => handleFromWarehouseChange(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                      <option value="">Select Warehouse</option>
                      {warehouses.map(w => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">To Warehouse</label>
                    <select required value={formData.toWarehouse} onChange={e => setFormData({...formData, toWarehouse: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                      <option value="">Select Warehouse</option>
                      {warehouses.filter(w => w._id !== formData.fromWarehouse).map(w => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quantity to Transfer</label>
                    <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </>
              )}

              {type === 'Adjustment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">System Quantity</label>
                    <input disabled type="number" value={formData.systemQuantity} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 bg-slate-50 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Counted Quantity</label>
                    <input required type="number" min="0" value={formData.countedQuantity} onChange={e => setFormData({...formData, countedQuantity: Number(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
