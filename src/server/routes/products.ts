import express from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { protect, managerOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('stockByWarehouse.warehouse', 'name location');
    res.json(products);
  }))
  .post(protect, asyncHandler(async (req, res) => {
    const { name, sku, category, unit, warehouse, stock, reorderLevel } = req.body;

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      res.status(400);
      throw new Error('Product with this SKU already exists');
    }

    const product = new Product({
      name, sku, category, unit, reorderLevel,
      stockByWarehouse: warehouse ? [{ warehouse, stock: stock || 0 }] : []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  }));

router.route('/:id')
  .get(protect, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('stockByWarehouse.warehouse', 'name location');
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  }))
  .put(protect, asyncHandler(async (req, res) => {
    const { name, sku, category, unit, warehouse, stock, reorderLevel } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.sku = sku || product.sku;
      product.category = category || product.category;
      product.unit = unit || product.unit;
      product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;
      
      // Update specific warehouse stock if provided
      if (warehouse && stock !== undefined) {
        const whIndex = product.stockByWarehouse.findIndex(w => w.warehouse?.toString() === warehouse);
        if (whIndex > -1) {
          product.stockByWarehouse[whIndex].stock = stock;
        } else {
          product.stockByWarehouse.push({ warehouse, stock });
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  }))
  .delete(protect, managerOnly, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  }));

export default router;
