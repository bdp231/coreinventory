import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  stockByWarehouse: [{
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    stock: { type: Number, default: 0 }
  }],
  reorderLevel: { type: Number, default: 10 },
}, { timestamps: true });

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  const stockEntries: any[] = this.stockByWarehouse || [];
  return stockEntries.reduce((total, item) => total + (item?.stock || 0), 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
