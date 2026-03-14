import express from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Operation from '../models/Operation.js';
import StockLedger from '../models/StockLedger.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const products = await Product.find({});
  const totalProducts = products.length;
  
  let lowStockItems = 0;
  let outOfStock = 0;

  const getTotalStock = (p: any) => (p.stockByWarehouse || []).reduce((sum: number, w: any) => sum + (w?.stock || 0), 0);

  products.forEach(p => {
    const totalStock = getTotalStock(p);
    if (totalStock === 0) outOfStock++;
    else if (totalStock <= p.reorderLevel) lowStockItems++;
  });
  
  const pendingReceipts = await Operation.countDocuments({ type: 'Receipt', status: 'Draft' });
  const pendingDeliveries = await Operation.countDocuments({ type: 'Delivery', status: 'Draft' });
  const internalTransfers = await Operation.countDocuments({ type: 'Transfer', status: 'Draft' });

  const recentActivity = await StockLedger.find({})
    .populate('product', 'name')
    .sort('-timestamp')
    .limit(30);

  const topProducts = products
    .map(p => ({ name: p.name, stock: getTotalStock(p) }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const operationsBreakdown = await Operation.aggregate([
    { $match: { status: 'Done' } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const stockByWarehouse = await Product.aggregate([
    { $unwind: '$stockByWarehouse' },
    { $group: { _id: '$stockByWarehouse.warehouse', totalStock: { $sum: '$stockByWarehouse.stock' } } },
    { $lookup: { from: 'warehouses', localField: '_id', foreignField: '_id', as: 'warehouseInfo' } },
    { $unwind: { path: '$warehouseInfo', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$warehouseInfo.name', 'Unassigned'] }, totalStock: 1, _id: 0 } }
  ]);

  const pendingOperationsList = await Operation.find({ 
    type: { $in: ['Receipt', 'Delivery'] }, 
    status: 'Draft' 
  })
  .populate('product', 'name')
  .sort('-createdAt')
  .limit(10);

  // Get specific low stock products for alerts
  const lowStockAlerts = products
    .filter(p => {
      const totalStock = getTotalStock(p);
      return totalStock <= p.reorderLevel;
    })
    .map(p => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      stock: getTotalStock(p),
      reorderLevel: p.reorderLevel
    }));

  res.json({
    totalProducts,
    lowStockItems,
    outOfStock,
    pendingReceipts,
    pendingDeliveries,
    internalTransfers,
    recentActivity,
    topProducts,
    operationsBreakdown: operationsBreakdown.map(op => ({ name: op._id, value: op.count })),
    stockByWarehouse,
    pendingOperationsList,
    lowStockAlerts
  });
}));

export default router;
