import mongoose from 'mongoose';

const operationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  
  // For Receipts
  supplierName: { type: String },
  
  // For Deliveries
  customerName: { type: String },
  
  // For Transfers
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  
  // For Adjustments
  systemQuantity: { type: Number },
  countedQuantity: { type: Number },
  
  // Common
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }, // Primary warehouse for Receipt/Delivery/Adjustment
  status: { type: String, enum: ['Draft', 'Done'], default: 'Draft' },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Operation', operationSchema);
