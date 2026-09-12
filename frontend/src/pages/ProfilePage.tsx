import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Store,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import { api } from '../services/api';

interface ProfilePageProps {
  onOpenOrders: () => void;
  onOpenSellerDashboard: () => void;
  onOpenAdminDashboard: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenOrders,
  onOpenSellerDashboard,
  onOpenAdminDashboard,
}) => {
  const { user, role, switchRole } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || 'Priya Sharma',
    phone: user?.phone || '9876543210',
    street: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    isDefault: false,
  });

  const loadAddresses = async () => {
    try {
      const res = await api.getAddresses();
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddr);
      if (res.success && res.address) {
        setAddresses((prev) => [...prev, res.address]);
        setShowAddAddr(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user?.name.charAt(0) || 'P'}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{user?.name}</h1>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800 self-center sm:self-auto">
                Role: {role}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                +91 {user?.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reseller Earnings Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-5 text-white mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-200" />
            <h2 className="font-bold text-sm uppercase tracking-wider">
              Shopzy Reseller Earnings & Wallet
            </h2>
          </div>
          <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold">
            Zero Investment
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-black/15 p-3 rounded-xl">
            <span className="text-xs text-amber-100 block">Total Margins Earned</span>
            <span className="text-2xl font-black">₹650</span>
          </div>
          <div className="bg-black/15 p-3 rounded-xl">
            <span className="text-xs text-amber-100 block">Pending Clearance</span>
            <span className="text-2xl font-black">₹150</span>
          </div>
          <div className="bg-black/15 p-3 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-xs text-amber-100 block">Registered UPI</span>
            <span className="text-sm font-bold truncate block mt-1">priya@okaxis</span>
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <h2 className="font-bold text-sm text-gray-900">Saved Delivery Addresses</h2>
          </div>
          <button
            onClick={() => setShowAddAddr(!showAddAddr)}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddAddr ? 'Cancel' : 'Add New'}</span>
          </button>
        </div>

        {showAddAddr && (
          <form onSubmit={handleAddAddress} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Street Address</label>
              <input
                type="text"
                required
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                placeholder="House no, Street, Landmark"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">City</label>
                <input
                  type="text"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">State</label>
                <input
                  type="text"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg cursor-pointer hover:bg-rose-700 shadow-xs"
            >
              Save Address
            </button>
          </form>
        )}

        <div className="space-y-2.5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 rounded-xl border border-gray-200 text-xs flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-gray-500 mt-0.5">Phone: +91 {addr.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Switch Demo Roles Section */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs">
        <h2 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b border-gray-100">
          Switch User Experience (Roles)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => switchRole('customer')}
            className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
              role === 'customer'
                ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-gray-900">Customer</span>
              {role === 'customer' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
            </div>
            <p className="text-[11px] text-gray-500">
              Browse products, track orders, chat with Sathi AI & resell.
            </p>
          </button>

          <button
            onClick={() => {
              switchRole('seller');
              onOpenSellerDashboard();
            }}
            className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
              role === 'seller'
                ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-gray-900">Seller Dashboard</span>
              {role === 'seller' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
            </div>
            <p className="text-[11px] text-gray-500">
              List new inventory, manage stock & update order dispatches.
            </p>
          </button>

          <button
            onClick={() => {
              switchRole('admin');
              onOpenAdminDashboard();
            }}
            className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
              role === 'admin'
                ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-gray-900">Admin Dashboard</span>
              {role === 'admin' && <CheckCircle2 className="w-4 h-4 text-gray-900" />}
            </div>
            <p className="text-[11px] text-gray-500">
              Platform GMV analytics, order lifecycle & catalog control.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
