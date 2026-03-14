import express from 'express';
import asyncHandler from 'express-async-handler';
import Operation from '../models/Operation.js';
import Product from '../models/Product.js';
import StockLedger from '../models/StockLedger.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all operations or filter by type
router.get('/', protect, asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};
  
  const operations = await Operation.find(query)
    .populate('product', 'name sku')
    .populate('warehouse', 'name')
    .populate('fromWarehouse', 'name')
    .populate('toWarehouse', 'name')
    .populate('user', 'name')
    .sort('-createdAt');
    
  res.json(operations);
}));

// Create an operation
router.post('/', protect, asyncHandler(async (req: any, res: any) => {
  const { 
    type, product, quantity, supplierName, customerName, 
    fromWarehouse, toWarehouse, systemQuantity, countedQuantity, warehouse 
  } = req.body;

  const normalizeId = (value: any) => {
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  };

  const operation = new Operation({
    type,
    product,
    quantity,
    supplierName,
    customerName,
    fromWarehouse: normalizeId(fromWarehouse),
    toWarehouse: normalizeId(toWarehouse),
    systemQuantity,
    countedQuantity,
    warehouse: normalizeId(warehouse),
    user: req.user._id,
    status: 'Draft'
  });

  const createdOperation = await operation.save();
  res.status(201).json(createdOperation);
}));

// Validate (Done) an operation
router.put('/:id/validate', protect, asyncHandler(async (req: any, res: any) => {
  const operation = await Operation.findById(req.params.id);

  if (!operation) {
    res.status(404);
    throw new Error('Operation not found');
  }

  if (operation.status === 'Done') {
    res.status(400);
    throw new Error('Operation already validated');
  }

  const product = await Product.findById(operation.product);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let quantityChange = 0;
  let targetWarehouse = operation.warehouse;

  // Helper to get or create warehouse stock entry
  const getWarehouseStock = (warehouseId: any) => {
    let whStock = product.stockByWarehouse.find((w: any) => w.warehouse?.toString() === warehouseId?.toString());
    if (!whStock) {
      product.stockByWarehouse.push({ warehouse: warehouseId, stock: 0 });
      whStock = product.stockByWarehouse[product.stockByWarehouse.length - 1];
    }
    return whStock;
  };

  if (operation.type === 'Receipt') {
    quantityChange = operation.quantity;
    const whStock = getWarehouseStock(operation.warehouse);
    whStock.stock += quantityChange;
  } else if (operation.type === 'Delivery') {
    quantityChange = -operation.quantity;
    const whStock = getWarehouseStock(operation.warehouse);
    if (whStock.stock < operation.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock in warehouse`);
    }
    whStock.stock += quantityChange;
  } else if (operation.type === 'Transfer') {
    quantityChange = 0;
    targetWarehouse = operation.toWarehouse;
    
    const fromWhStock = getWarehouseStock(operation.fromWarehouse);
    const toWhStock = getWarehouseStock(operation.toWarehouse);
    
    if (fromWhStock.stock < operation.quantity) {
      res.status(400);
      throw new Error('Insufficient stock in source warehouse');
    }
    
    fromWhStock.stock -= operation.quantity;
    toWhStock.stock += operation.quantity;
  } else if (operation.type === 'Adjustment') {
    quantityChange = operation.countedQuantity - operation.systemQuantity;
    const whStock = getWarehouseStock(operation.warehouse);
    whStock.stock = operation.countedQuantity;
  }

  await product.save();

  operation.status = 'Done';
  await operation.save();

  // Create Ledger Entry
  if (operation.type !== 'Transfer' || quantityChange !== 0 || operation.type === 'Transfer') {
    await StockLedger.create({
      product: product._id,
      operationType: operation.type,
      operationId: operation._id,
      quantityChange: quantityChange !== 0 ? quantityChange : operation.quantity, // For transfer we log the transferred amount
      warehouse: targetWarehouse || operation.warehouse,
      user: req.user._id
    });
  }

  res.json(operation);
}));

// Get Move History
router.get('/history', protect, asyncHandler(async (req, res) => {
  const history = await StockLedger.find({})
    .populate('product', 'name sku')
    .populate('warehouse', 'name')
    .populate('user', 'name')
    .sort('-timestamp');
    
  res.json(history);
}));

export default router;
