import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ArrowLeft,
  AlertCircle,
  Star,
  MessageCircle,
  X,
  User,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from './Modal';
import OrderReviewModal from './OrderReviewModal';
import ServiceReviewModal from './ServiceReviewModal';

const OrderTracking = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [showServiceReviewModal, setShowServiceReviewModal] = useState(false);
  const [serviceReviewOrder, setServiceReviewOrder] = useState(null);
  const [existingReviews, setExistingReviews] = useState({}); // Store existing reviews by orderId
  const { user, getAuthHeaders } = useAuth();
  const { error, success } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  // Listen for order placement events to auto-refresh
  useEffect(() => {
    const handleOrderPlaced = () => {
      console.log('🔄 Order placed event received, refreshing orders...');
      fetchOrders();
    };

    window.addEventListener('orderPlaced', handleOrderPlaced);
    return () => window.removeEventListener('orderPlaced', handleOrderPlaced);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/orders/my-orders?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setPagination(data.pagination || {});
        
        // Fetch existing reviews for these orders in background (non-blocking)
        fetchExistingReviews(data.orders || []).catch(err => 
          console.log('Background review fetch failed:', err)
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      console.log('✅ Finished fetching orders');
    }
  };

  const fetchExistingReviews = async (ordersList) => {
    try {
      console.log('🔍 Fetching existing reviews for orders...');
      const reviewsData = {};
      
      // For each order, check for existing vendor and service reviews
      for (const order of ordersList) {
        reviewsData[order._id] = {
          vendorReviews: [],
          serviceReview: null
        };
        
        // Fetch vendor reviews for this order
        try {
          const vendorReviewsResponse = await fetch(`/api/reviews/order/${order._id}`, {
            headers: getAuthHeaders()
          });
          if (vendorReviewsResponse.ok) {
            const vendorData = await vendorReviewsResponse.json();
            reviewsData[order._id].vendorReviews = vendorData.reviews || [];
            console.log(`📝 Vendor reviews for order ${order._id}:`, vendorData.reviews?.length || 0, vendorData.reviews);
          } else {
            console.log(`❌ Failed to fetch vendor reviews for order ${order._id}:`, vendorReviewsResponse.status);
          }
        } catch (err) {
          console.log('Could not fetch vendor reviews for order:', order._id, err);
        }
        
        // Fetch service review for this order
        try {
          const serviceReviewResponse = await fetch(`/api/service-reviews/order/${order._id}`, {
            headers: getAuthHeaders()
          });
          if (serviceReviewResponse.ok) {
            const serviceData = await serviceReviewResponse.json();
            reviewsData[order._id].serviceReview = serviceData.review || null;
          }
        } catch (err) {
          console.log('Could not fetch service review for order:', order._id);
        }
      }
      
      console.log('📝 Existing reviews data:', reviewsData);
      setExistingReviews(reviewsData);
    } catch (err) {
      console.error('❌ Error fetching existing reviews:', err);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      error('Failed to load order details');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        success('Order cancelled successfully');
        // Refresh orders list
        fetchOrders();
        // Close modal if order details are open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      error(err.message || 'Failed to cancel order');
    }
  };

  const handleReviewOrder = (order) => {
    setReviewOrder(order);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    // Refresh orders and existing reviews when a review is submitted
    console.log('🔄 Review submitted, refreshing orders...');
    setTimeout(() => {
      fetchOrders();
    }, 200); // Reduced delay for faster refresh
  };

  const handleServiceReview = (order) => {
    setServiceReviewOrder(order);
    setShowServiceReviewModal(true);
  };

  const handleServiceReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch('/api/service-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        success('Service review submitted successfully!');
        setShowServiceReviewModal(false);
        // Refresh orders to update review status
        console.log('🔄 Service review submitted, refreshing orders...');
        setTimeout(() => {
          fetchOrders();
        }, 200); // Reduced delay for faster refresh
      } else {
        const errorData = await response.json();
        console.error('Service review error:', errorData);
        throw new Error(errorData.message || 'Failed to submit service review');
      }
    } catch (error) {
      throw error;
    }
  };

  // Helper function to check if vendor reviews exist for an order
  const hasVendorReviews = (orderId) => {
    const reviews = existingReviews[orderId];
    const hasReviews = reviews && reviews.vendorReviews && reviews.vendorReviews.length > 0;
    console.log(`🔍 hasVendorReviews for order ${orderId}:`, hasReviews, 'Reviews data:', reviews);
    return hasReviews;
  };

  // Helper function to check if service review exists for an order
  const hasServiceReview = (orderId) => {
    const reviews = existingReviews[orderId];
    return reviews && reviews.serviceReview !== null;
  };

  // Helper function to get completed vendor count for an order
  const getCompletedVendorCount = (orderId) => {
    const reviews = existingReviews[orderId];
    return reviews && reviews.vendorReviews ? reviews.vendorReviews.length : 0;
  };

  // Helper function to get total vendor count for an order
  const getTotalVendorCount = (order) => {
    const vendorIds = new Set();
    order.items?.forEach(item => {
      if (item.vendor?._id) {
        vendorIds.add(item.vendor._id);
      }
    });
    return vendorIds.size;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'processing':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'shipped':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'refunded':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusProgress = (status) => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  const getDeliveryEstimate = (order) => {
    if (order.status === 'delivered') {
      return 'Delivered';
    }
    
    if (order.estimatedDelivery) {
      const deliveryDate = new Date(order.estimatedDelivery);
      const today = new Date();
      const diffTime = deliveryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'Overdue';
      } else if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Tomorrow';
      } else {
        return `${diffDays} days`;
      }
    }
    
    return 'TBD';
  };

  const OrderStatusTimeline = ({ order }) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: Clock },
      { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { status: 'processing', label: 'Processing', icon: Package },
      { status: 'shipped', label: 'Shipped', icon: Truck },
      { status: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStatusIndex = steps.findIndex(step => step.status === order.status);

    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          
          return (
            <div key={step.status} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="ml-4 flex-1">
                <div className={`font-medium ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                  {step.label}
                </div>
                {isCurrent && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Current status
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`absolute left-4 mt-8 w-0.5 h-6 ${
                  isCompleted ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} style={{ marginLeft: '15px' }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-blue-500 dark:text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fancy Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-6 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </button>
              <div className="relative">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  My Orders
                </h1>
                <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
                  Track your medicine orders and delivery status
                </p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by tracking ID or medicine name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center py-16 backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
                <Package className="h-20 w-20 text-gray-400 dark:text-gray-500 mx-auto mb-6 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to find your orders' 
                  : 'Your medicine orders will appear here once you make a purchase'}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Order #{order.trackingId}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} at {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order details summary */}
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-4 mb-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.items?.length || 0} item(s)
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ৳{order.total?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Status Badge */}
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border shadow-lg ${getStatusColor(order.status)} transition-all duration-200 hover:scale-105`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2 capitalize">{order.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Order Progress</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{Math.round(getStatusProgress(order.status))}% Complete</span>
                      </div>
                      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out transform origin-left"
                          style={{ width: `${getStatusProgress(order.status)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Order Items Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-3">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <div key={index} className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 border-3 border-white dark:border-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-3 border-white dark:border-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                +{order.items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {order.items?.length} medicine{order.items?.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Estimated delivery: <span className="font-bold text-blue-600 dark:text-blue-400">{getDeliveryEstimate(order)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => fetchOrderDetails(order._id)}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      View Details
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            cancelOrder(order._id);
                          }
                        }}
                        className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel Order
                      </button>
                    )}
                    {(order.status === 'delivered' || order.status === 'shipped') && (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        {/* Vendor Review Button */}
                        <button 
                          onClick={() => handleReviewOrder(order)}
                          disabled={hasVendorReviews(order._id) && getCompletedVendorCount(order._id) >= getTotalVendorCount(order)}
                          className={`flex items-center justify-center px-4 py-2 border-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm ${
                            hasVendorReviews(order._id) 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 cursor-default'
                              : 'bg-white dark:bg-gray-700 border-yellow-400 dark:border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          }`}
                        >
                          <Star className={`h-4 w-4 mr-2 ${hasVendorReviews(order._id) ? 'fill-current' : ''}`} />
                          {hasVendorReviews(order._id) 
                            ? `Reviewed (${getCompletedVendorCount(order._id)}/${getTotalVendorCount(order)})`
                            : 'Review Vendor'
                          }
                        </button>
                        
                        {/* Service Review Button */}
                        <button 
                          onClick={() => handleServiceReview(order)}
                          disabled={hasServiceReview(order._id)}
                          className={`flex items-center justify-center px-4 py-2 border-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm ${
                            hasServiceReview(order._id)
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 cursor-default'
                              : 'bg-white dark:bg-gray-700 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${hasServiceReview(order._id) ? 'fill-current' : ''}`} />
                          {hasServiceReview(order._id) ? 'Service Reviewed' : 'Review Service'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalItems)} of {pagination.totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Order Details Modal */}
      {selectedOrder && (
        <Modal 
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details - #${selectedOrder.trackingId}`}
          size="xlarge"
        >
          <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
            {/* Enhanced Order Status Header */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      Payment: {selectedOrder.paymentStatus}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ৳{selectedOrder.total?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedOrder.items?.length || 0} item(s)
                  </div>
                </div>
              </div>
              
              {selectedOrder.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        cancelOrder(selectedOrder._id);
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Order
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Order Status
                </h4>
                <OrderStatusTimeline order={selectedOrder} />
              </div>

              {/* Order Information */}
              <div className="space-y-6">
                {/* Order Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Details</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Order Placed:</span>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          at {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Order Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        ৳{selectedOrder.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Delivery Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex items-start">
                      <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.shippingAddress?.fullName}</div>
                        <div className="text-gray-600 dark:text-gray-300">{selectedOrder.shippingAddress?.address}</div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-900 dark:text-gray-100">{selectedOrder.shippingAddress?.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-900 dark:text-gray-100">{selectedOrder.shippingAddress?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Payment Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Payment Method:</span>
                      <span className="capitalize font-medium text-gray-900 dark:text-gray-100">
                        {selectedOrder.paymentMethod?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Payment Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.medicine?.name || 'Medicine'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity} × ৳{item.price?.toFixed(2)}
                        </div>
                        {item.vendor && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Vendor: {item.vendor.firstName} {item.vendor.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        ৳{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="space-y-2 text-sm max-w-sm ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="text-gray-900 dark:text-gray-100">৳{selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Delivery Fee:</span>
                    <span className="text-gray-900 dark:text-gray-100">৳{selectedOrder.deliveryFee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="text-green-600 dark:text-green-400">৳{selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      <OrderReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={reviewOrder}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Service Review Modal */}
      <ServiceReviewModal
        isOpen={showServiceReviewModal}
        onClose={() => setShowServiceReviewModal(false)}
        order={serviceReviewOrder}
        onSubmitReview={handleServiceReviewSubmit}
      />
    </div>
  );
};

export default OrderTracking;
