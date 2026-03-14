import express from 'express';
import asyncHandler from 'express-async-handler';
import Warehouse from '../models/Warehouse.js';
import { protect, managerOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, asyncHandler(async (req, res) => {
    const warehouses = await Warehouse.find({});
    res.json(warehouses);
  }))
  .post(protect, managerOnly, asyncHandler(async (req, res) => {
    const { name, location } = req.body;

    const warehouseExists = await Warehouse.findOne({ name });
    if (warehouseExists) {
      res.status(400);
      throw new Error('Warehouse already exists');
    }

    const warehouse = new Warehouse({ name, location });
    const createdWarehouse = await warehouse.save();
    res.status(201).json(createdWarehouse);
  }));

router.route('/:id')
  .put(protect, managerOnly, asyncHandler(async (req, res) => {
    const { name, location } = req.body;
    const warehouse = await Warehouse.findById(req.params.id);

    if (warehouse) {
      warehouse.name = name || warehouse.name;
      warehouse.location = location || warehouse.location;
      const updatedWarehouse = await warehouse.save();
      res.json(updatedWarehouse);
    } else {
      res.status(404);
      throw new Error('Warehouse not found');
    }
  }))
  .delete(protect, managerOnly, asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.findById(req.params.id);
    if (warehouse) {
      await warehouse.deleteOne();
      res.json({ message: 'Warehouse removed' });
    } else {
      res.status(404);
      throw new Error('Warehouse not found');
    }
  }));

export default router;
