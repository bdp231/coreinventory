import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  operationType: { type: String, enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'], required: true },
  operationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operation', required: true },
  quantityChange: { type: Number, required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('StockLedger', stockLedgerSchema);
