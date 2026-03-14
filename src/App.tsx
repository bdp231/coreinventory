/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Operations from './pages/Operations';
import MoveHistory from './pages/MoveHistory';
import WarehouseSettings from './pages/WarehouseSettings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/receipts" element={<Operations type="Receipt" title="Receipts" />} />
            <Route path="/deliveries" element={<Operations type="Delivery" title="Deliveries" />} />
            <Route path="/transfers" element={<Operations type="Transfer" title="Internal Transfers" />} />
            <Route path="/adjustments" element={<Operations type="Adjustment" title="Inventory Adjustments" />} />
            <Route path="/history" element={<MoveHistory />} />
            <Route path="/warehouses" element={<WarehouseSettings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
