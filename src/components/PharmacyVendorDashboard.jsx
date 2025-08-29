import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Clock, AlertCircle, Heart, Pill, Users, BarChart3, Plus, Settings, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MedicineManagement from './MedicineManagement';
import VendorOrderManagement from './VendorOrderManagement';
import VendorReports from './VendorReports';
import VendorReviews from './VendorReviews';
import DailyUpdates from './DailyUpdates';
import ProfileManagement from './ProfileManagement';
import TopBar from './TopBar';

const PharmacyVendorDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalMedicines: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    
    // Set up real-time refresh every 30 seconds for statistics
    const statsInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard stats...');
      fetchDashboardStats();
    }, 30000);

    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard stats for vendor:', user?.id);

      // Fetch vendor statistics
      const [statsResponse, medicinesResponse] = await Promise.all([
        fetch('/api/orders/vendor/stats?timeframe=30d', {
          headers: getAuthHeaders()
        }),
        fetch('/api/medicines/search?vendorId=' + user?.id, {
          headers: getAuthHeaders()
        })
      ]);

      let stats = { summary: {} };
      let medicines = { medicines: [] };

      if (statsResponse.ok) {
        stats = await statsResponse.json();
        console.log('✅ Stats fetched successfully:', stats);
      } else {
        const error = await statsResponse.text();
        console.error('❌ Failed to fetch stats:', statsResponse.status, error);
      }

      if (medicinesResponse.ok) {
        medicines = await medicinesResponse.json();
        console.log('✅ Medicines fetched successfully:', medicines.medicines?.length, 'items');
      } else {
        const error = await medicinesResponse.text();
        console.error('❌ Failed to fetch medicines:', medicinesResponse.status, error);
      }

      const newStats = {
        totalMedicines: medicines.medicines?.length || 0,
        totalOrders: stats.summary?.totalOrders || 0,
        pendingOrders: stats.summary?.pending || 0,
        lowStockItems: medicines.medicines?.filter(m => m.stockQuantity < 10).length || 0,
        totalRevenue: stats.summary?.totalRevenue || 0
      };

      console.log('📈 Dashboard stats updated:', newStats);
      setDashboardStats(newStats);

    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Bar */}
      <TopBar 
        title="MedZy Vendor Dashboard" 
        subtitle="Manage your pharmacy operations with ease"
      />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              � Overview
            </button>
            <button
              onClick={() => setActiveTab('medicines')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'medicines'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              � Medicine Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              � Orders
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              📈 Reports
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              ⭐ Reviews
            </button>
            <button
              onClick={() => setActiveTab('daily-updates')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'daily-updates'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              � Daily Updates
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <h2 className="text-3xl font-bold mb-2">💊 Welcome to MedZy, {user?.firstName}!</h2>
            <p className="opacity-90 text-lg">Manage your pharmacy operations with ease</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {/* <button
                onClick={() => setActiveTab('medicines')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-5 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105 transform"
              >
                <Package className="h-4 w-4" />
                <span>Manage Inventory</span>
              </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-5 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105 transform"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>View Orders</span>
                </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-5 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105 transform"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Reports</span>
              </button> */}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalMedicines}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {dashboardStats.totalMedicines > 0 ? 'In inventory' : 'Ready for inventory'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalOrders}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {dashboardStats.totalOrders > 0 ? 'Last 30 days' : 'Awaiting first order'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.pendingOrders}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {dashboardStats.pendingOrders > 0 ? 'Need attention' : 'No pending orders'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.lowStockItems}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {dashboardStats.lowStockItems > 0 ? 'Items need restock' : 'All items in stock'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          {dashboardStats.totalRevenue > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-6 border dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">💰 Revenue Summary</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ৳{dashboardStats.totalRevenue.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total revenue (Last 30 days)</p>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                  >
                    📊 View Detailed Reports
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                 onClick={() => setActiveTab('medicines')}>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">💊 Manage Inventory</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Add, update, and track your medicine inventory
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  {dashboardStats.totalMedicines} medicines in stock
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                 onClick={() => setActiveTab('orders')}>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🛒 Process Orders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  View and manage customer orders
                </p>
                <div className="text-green-600 dark:text-green-400 font-medium">
                  {dashboardStats.pendingOrders} pending orders
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                 onClick={() => setActiveTab('reports')}>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📈 View Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Analyze sales and performance data
                </p>
                <div className="text-purple-600 dark:text-purple-400 font-medium">
                  ৳{dashboardStats.totalRevenue.toFixed(2)} total revenue
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started Guide */}
          {dashboardStats.totalMedicines === 0 && (
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-xl shadow-sm border dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">🏥 Pharmacy Management System</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Start managing your pharmacy inventory efficiently!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto mb-8">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <Pill className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                      💊 Inventory Management
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Add and manage medicines</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Track stock levels</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Monitor expiry dates</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Stock in/out tracking</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      👥 Features Available
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Complete medicine database</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Real-time stock updates</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Low stock alerts</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">• Comprehensive reporting</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                    🚀 <strong>Ready to Start:</strong> Medicine Inventory Management
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Click on "Medicine Inventory" tab to start adding your medicines and managing your pharmacy stock.
                  </p>
                  <div className="mt-4">
                    <button 
                      onClick={() => setActiveTab('medicines')}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                    >
                      📋 Start Managing Inventory
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'medicines' && <MedicineManagement />}

      {activeTab === 'orders' && <VendorOrderManagement />}

      {activeTab === 'reports' && <VendorReports />}

      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Reviews</h2>
          <VendorReviews />
        </div>
      )}

      {activeTab === 'daily-updates' && <DailyUpdates />}
    </div>
  );
};

export default PharmacyVendorDashboard;
