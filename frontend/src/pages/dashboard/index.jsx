import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../component/dashboard/DashboardLayout';
import Users from './users';
import Products from './products';
import Collections from './collections';
import Stores from './stores';
import Reviews from './reviews';
import Orders from './orders';
import Reports from './reports';
import Settings from './settings';
import '../../styles/dashboard/index.css';

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={
          <div className="dashboard-page">
            <h2>Welcome to the Admin Dashboard</h2>
            <div className="content-wrapper">
              <p>Select a section from the sidebar to manage your data.</p>
            </div>
          </div>
        } />
        <Route path="/users" element={<Users />} />
        <Route path="/products" element={<Products />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
} 