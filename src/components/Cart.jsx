import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { API_ENDPOINTS } from '../config/api';
import Modal from './Modal';

// Enhanced CartItem component with clear medicine information display
const CartItem = ({ item, updateQuantity, removeItem, updatingItems }) => {
  const medicineId = item.medicine?._id || item.medicineId || item._id;
  const medicineName = item.medicine?.name || item.name || 'Unknown Medicine';
  const medicinePrice = item.medicine?.price || item.price || 0;
  const quantity = item.quantity || 0;
  const itemTotal = (medicinePrice * quantity).toFixed(2);
  const isUpdating = updatingItems.has(medicineId);
  const genericName = item.medicine?.genericName || item.genericName || '';
  const vendor = item.medicine?.vendor?.name || item.medicine?.vendorId?.firstName + ' ' + item.medicine?.vendorId?.lastName || 'Unknown Vendor';

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Medicine Information - More prominent display */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
        {/* Left side - Medicine details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {medicineName}
            </h3>
            
            {/* Price prominently displayed */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ৳{medicinePrice}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">each</span>
            </div>
            
            {/* Additional medicine info */}
            {genericName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Generic:</span> {genericName}
              </p>
            )}
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Vendor:</span> {vendor}
            </p>
          </div>
        </div>
        
        {/* Right side - Quantity controls and total */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Quantity controls */}
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <button
              onClick={() => updateQuantity(medicineId, quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition-all duration-200"
            >
              <Minus size={14} />
            </button>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[2rem] text-center block">
                {quantity}
              </span>
            </div>
            
            <button
              onClick={() => updateQuantity(medicineId, quantity + 1)}
              disabled={isUpdating}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all duration-200"
            >
              <Plus size={14} />
            </button>
          </div>
          
          {/* Item total and remove button */}
          <div className="flex flex-col items-end space-y-2">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total:</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                ৳{itemTotal}
              </div>
            </div>
            
            <button
              onClick={() => removeItem(medicineId)}
              disabled={isUpdating}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-all duration-200"
              title="Remove from cart"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle loading indicator in quantity display instead of full overlay */}
      {isUpdating && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span>Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Cart = ({ onContinueShopping, onClose }) => {
  const { getAuthHeaders } = useAuth();
  const { success, error } = useNotification();
  
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set()); // Track which items are updating
  const [showCheckout, setShowCheckout] = useState(false);

  // Simple fetchCart without useCallback
  const fetchCart = async () => {
    setLoading(true);
    
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        setCartItems([]);
        setCartSummary({});
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/cart`, { headers });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        setCartSummary(data.summary || {});
      } else {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      error('Failed to load cart');
      setCartItems([]);
      setCartSummary({});
    } finally {
      setLoading(false);
    }
  };

  // Ultra-fast updateQuantity with instant UI response
  const updateQuantity = async (medicineId, newQuantity) => {
    console.log('🔄 Updating quantity:', medicineId, newQuantity);
    
    if (newQuantity < 1) {
      error('Quantity cannot be less than 1');
      return;
    }
    
    if (updatingItems.has(medicineId)) {
      return; // Already updating this item
    }
    
    // Store original state for potential rollback
    const originalItems = cartItems;
    const originalSummary = cartSummary;
    
    try {
      // Instant UI update - no loading state needed for quantity changes
      const updatedItems = cartItems.map(item => {
        if ((item.medicine?._id || item.medicineId || item._id) === medicineId) {
          const updatedItem = { ...item, quantity: newQuantity };
          updatedItem.itemTotal = (item.medicine?.price || item.price || 0) * newQuantity;
          return updatedItem;
        }
        return item;
      });
      
      setCartItems(updatedItems);
      
      // Calculate new summary based on updated items
      const newSubtotal = updatedItems.reduce((sum, item) => {
        const price = item.medicine?.price || item.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      
      const deliveryFee = newSubtotal > 500 ? 0 : 50;
      const total = newSubtotal + deliveryFee;
      
      setCartSummary({
        ...originalSummary,
        subtotal: newSubtotal,
        deliveryFee,
        total
      });

      // Mark as updating only for API call (non-blocking)
      setUpdatingItems(prev => new Set(prev).add(medicineId));

      // Make API call in background
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/cart/update`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicineId,
          quantity: newQuantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cart');
      }
      
      // Success - the optimistic update was correct
      console.log('✅ Quantity updated successfully');
      
    } catch (err) {
      console.error('Error updating quantity:', err);
      error(err.message || 'Failed to update quantity');
      
      // Revert optimistic update on error
      setCartItems(originalItems);
      setCartSummary(originalSummary);
    } finally {
      // Remove from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(medicineId);
        return newSet;
      });
    }
  };

  // Optimized removeItem with optimistic updates
  const removeItem = async (medicineId) => {
    console.log('🗑️ Removing item:', medicineId);
    
    if (updatingItems.has(medicineId)) {
      return; // Already updating this item
    }
    
    // Store original items for potential rollback
    const originalItems = cartItems;
    const originalSummary = cartSummary;
    
    // Optimistic update - remove from UI immediately
    const updatedItems = cartItems.filter(item => 
      (item.medicine?._id || item.medicineId || item._id) !== medicineId
    );
    
    setCartItems(updatedItems);
    
    // Update cart summary immediately
    const newSubtotal = updatedItems.reduce((sum, item) => {
      const price = item.medicine?.price || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const deliveryFee = newSubtotal > 500 ? 0 : 50;
    const total = newSubtotal + deliveryFee;
    
    setCartSummary({
      itemCount: updatedItems.length,
      subtotal: newSubtotal,
      deliveryFee,
      total
    });
    
    // Mark this item as updating
    setUpdatingItems(prev => new Set(prev).add(medicineId));
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/cart/remove/${medicineId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item');
      }
      
      success('Item removed from cart');
      
    } catch (err) {
      console.error('Error removing item:', err);
      error(err.message || 'Failed to remove item');
      
      // Revert optimistic update on error
      setCartItems(originalItems);
      setCartSummary(originalSummary);
    } finally {
      // Remove from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(medicineId);
        return newSet;
      });
    }
  };

  // Simple useEffect without dependency issues
  useEffect(() => {
    fetchCart();
  }, []); // Empty dependency array

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Cart Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review your items before checkout
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <div key={item._id || item.medicineId || index} className="relative">
              <CartItem
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                updatingItems={updatingItems}
              />
            </div>
          ))}
        </div>
        
        {/* Order Summary - 1/3 width on large screens, sticky */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 sm:p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            {/* Summary Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ৳{cartSummary.subtotal || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ৳{cartSummary.deliveryFee || 0}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ৳{cartSummary.total || cartSummary.subtotal || 0}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Delivery Info */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Free delivery</strong> on orders over ৳500
              </p>
              {cartSummary.deliveryFee > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Add ৳{(500 - (cartSummary.subtotal || 0)).toFixed(2)} more for free delivery
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowCheckout(true)}
                disabled={cartItems.length === 0 || updatingItems.size > 0}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </button>
              
              <button
                onClick={onContinueShopping || (() => window.location.href = '/customer')}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          cartSummary={cartSummary}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            fetchCart();
            // Trigger a custom event to notify other components about the new order
            window.dispatchEvent(new CustomEvent('orderPlaced'));
          }}
        />
      )}
    </div>
  );
};

// Enhanced Checkout Modal with improved responsiveness and compact design
const CheckoutModal = ({ cartItems, cartSummary, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const { getAuthHeaders } = useAuth();
  const { success, error } = useNotification();

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'city', 'postalCode'];
    return required.every(field => shippingAddress[field].trim() !== '');
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    console.log('🛒 Starting order placement process...', {
      paymentMethod,
      shippingAddress,
      cartItemsCount: cartItems.length
    });

    try {
      // Handle Cash on Delivery separately (direct order creation)
      if (paymentMethod === 'cash_on_delivery') {
        console.log('📡 Creating COD order directly...');
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentMethod,
            shippingAddress,
            notes: `Order placed via cart checkout - Payment: ${paymentMethod}`
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ COD Order created successfully:', data);
          success('🎉 Order placed successfully! Pay when your order arrives.');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          const data = await response.json();
          console.error('❌ COD Order creation failed:', data);
          error(data.message || 'Failed to place order');
        }
        return;
      }

      // Handle Payment Gateway methods (SSLCommerz only)
      const gatewayMethods = ['sslcommerz'];
      if (gatewayMethods.includes(paymentMethod)) {
        console.log(`🚀 Initializing ${paymentMethod} payment gateway...`);
        
        // Show payment processing message
        const paymentMessages = {
          'sslcommerz': 'Initializing SSLCommerz Gateway...'
        };
        
        success(paymentMessages[paymentMethod] || 'Initializing payment gateway...');

        // Prepare payment data
        const calculatedTotal = cartSummary.total || cartSummary.subtotal || 
          cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (!calculatedTotal || calculatedTotal <= 0) {
          error('Invalid cart total. Please refresh and try again.');
          return;
        }

        const paymentData = {
          gateway: paymentMethod,
          amount: calculatedTotal,
          currency: 'BDT',
          description: `Payment for ${cartItems.length} items from cart`,
          customerInfo: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            postcode: shippingAddress.postalCode
          },
          shippingAddress,
          cartItems: cartItems.map(item => ({
            productId: item.medicine?._id || item._id,
            name: item.medicine?.name || item.name,
            quantity: item.quantity,
            price: item.medicine?.price || item.price,
            vendorId: item.medicine?.vendorId || item.medicine?.vendor?._id || null,
            medicine: item.medicine?._id || item._id // For the Order model
          }))
        };

        console.log('📋 Payment request data:', {
          gateway: paymentData.gateway,
          amount: paymentData.amount,
          cartItemsCount: paymentData.cartItems.length,
          customerName: paymentData.customerInfo.name
        });

        // Initialize payment via payment gateway service
        const paymentResponse = await fetch(`${API_ENDPOINTS.BASE_URL}/api/payments/initialize`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });

        console.log('📨 Payment initialization response status:', paymentResponse.status);

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('✅ Payment initialized successfully:', paymentData);

          // Handle gateway-specific responses
          if (paymentData.redirectUrl || paymentData.GatewayPageURL) {
            const redirectUrl = paymentData.redirectUrl || paymentData.GatewayPageURL;
            console.log('🔗 Redirecting to payment gateway:', redirectUrl);
            
            // For SSLCommerz gateway, redirect in same window/tab
            if (paymentMethod === 'sslcommerz') {
              success('Redirecting to SSLCommerz payment gateway...');
              // Use window.location.href instead of window.open to avoid popup
              window.location.href = redirectUrl;
            } else {
              success(`Opening ${paymentMethod} payment gateway...`);
              window.location.href = redirectUrl;
            }
            
            // Don't close modal since we're redirecting away from the page
            return;
            
          } else if (paymentData.success) {
            // For dummy payments or instant success
            success(`✅ ${paymentMethod} payment successful! Order placed!`);
            setTimeout(() => {
              onSuccess();
            }, 1000);
          } else {
            error(paymentData.message || 'Payment initialization failed');
          }
        } else {
          const errorData = await paymentResponse.json();
          console.error('❌ Payment initialization failed:', errorData);
          error(errorData.message || 'Failed to initialize payment');
        }
        return;
      }

      // Handle Legacy Payment Methods (credit_card, mobile_banking, bank_transfer)
      console.log('� Processing legacy payment method...');
      
      // Show payment processing message
      const legacyPaymentMessages = {
        'credit_card': 'Processing card payment...',
        'mobile_banking': 'Connecting to mobile banking...',
        'bank_transfer': 'Generating transfer instructions...'
      };
      
      success(legacyPaymentMessages[paymentMethod] || 'Processing payment...');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order with legacy payment method
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          shippingAddress,
          notes: `Order placed via cart checkout - Payment: ${paymentMethod}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Legacy order created successfully:', data);
        
        // Show payment-specific success message
        const successMessages = {
          'credit_card': `🎉 Payment confirmed! Order placed successfully!`,
          'mobile_banking': `🎉 Mobile payment successful! Order placed!`,
          'bank_transfer': `🎉 Order placed! Transfer instructions sent via email.`
        };
        
        success(successMessages[paymentMethod] || `🎉 Order placed successfully!`);
        
        setTimeout(() => {
          onSuccess();
        }, 1000);
        
      } else {
        const data = await response.json();
        console.error('❌ Legacy order creation failed:', data);
        error(data.message || 'Failed to place order');
      }

    } catch (err) {
      console.error('❌ Error placing order:', err);
      error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Checkout" size="xl">
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Compact Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {[1, 2, 3].map((stepNum, index) => (
                <React.Fragment key={stepNum}>
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                    step >= stepNum 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {stepNum}
                  </div>
                  {index < 2 && (
                    <div className={`w-8 sm:w-16 h-1 rounded ${
                      step > stepNum 
                        ? 'bg-blue-600 dark:bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4 sm:space-x-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className={step >= 1 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                Address
              </span>
              <span className={step >= 2 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                Payment
              </span>
              <span className={step >= 3 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                Review
              </span>
            </div>
          </div>

          {/* Step 1: Shipping Address - Compact Layout */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="Email address"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="Full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method - Compact Layout */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
              <div className="space-y-3">
                {/* Cash on Delivery - Highlighted as recommended */}
                <div className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`} onClick={() => setPaymentMethod('cash_on_delivery')}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 dark:focus:ring-green-400"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Cash on Delivery</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Pay when your order arrives</div>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Recommended</span>
                  </label>
                </div>
                
                {/* Other payment methods - Only SSLCommerz */}
                {[
                  { id: 'sslcommerz', name: 'SSLCommerz Gateway', desc: 'Cards, Mobile Banking, Net Banking', icon: '🛡️', type: 'real' }
                ].map((method) => (
                  <div key={method.id} className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`} onClick={() => setPaymentMethod(method.id)}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{method.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{method.name}</span>
                          {method.type === 'real' && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">LIVE</span>
                          )}
                          {method.type === 'demo' && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">DEMO</span>
                          )}
                          {method.type === 'test' && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">TEST</span>
                          )}
                          {method.type === 'legacy' && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">LEGACY</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{method.desc}</div>
                        {method.type === 'demo' && (
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            <strong>Demo Mode:</strong> Simulated payment
                          </div>
                        )}
                        {method.type === 'test' && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <strong>Test Mode:</strong> For development only
                          </div>
                        )}
                        {method.type === 'real' && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            <strong>Live Gateway:</strong> Real payment processing
                          </div>
                        )}
                      </div>
                      <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review Order - Compact Layout */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Your Order</h3>
              
              {/* Compact review sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping Address Review */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Shipping Address</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{shippingAddress.fullName}</span><br />
                    {shippingAddress.address}<br />
                    {shippingAddress.city}, {shippingAddress.postalCode}<br />
                    <span className="text-blue-600 dark:text-blue-400">{shippingAddress.phone}</span>
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs mt-1 underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Payment Method Review */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Payment Method</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {paymentMethod === 'cash_on_delivery' && '💵 Cash on Delivery'}
                      {paymentMethod === 'bkash' && '📱 bKash'}
                      {paymentMethod === 'sslcommerz' && '🛡️ SSLCommerz Gateway'}
                      {paymentMethod === 'stripe' && '💳 Stripe (International Cards)'}
                      {paymentMethod === 'nagad' && '📱 Nagad (Demo)'}
                      {paymentMethod === 'rocket' && '🚀 Rocket (Demo)'}
                      {paymentMethod === 'credit_card' && '💳 Credit/Debit Card (Legacy)'}
                      {paymentMethod === 'mobile_banking' && '📱 Mobile Banking (Legacy)'}
                      {paymentMethod === 'bank_transfer' && '🏦 Bank Transfer'}
                      {paymentMethod === 'dummy' && '🧪 Test Payment'}
                    </span>
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs mt-1 underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex justify-between py-1">
                      <span className="text-gray-700 dark:text-gray-300 truncate mr-2">
                        <span className="font-medium">{item.medicine?.name || 'Medicine'}</span> x{item.quantity}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">৳{((item.medicine?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                      ... and {cartItems.length - 3} more items
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-800 dark:text-gray-200">৳{cartSummary.subtotal || 0}</span>
                  </div>
                  {cartSummary.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                      <span className="text-gray-800 dark:text-gray-200">৳{cartSummary.deliveryFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-green-600 dark:text-green-400 border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                    <span>Total:</span>
                    <span>৳{cartSummary.total || cartSummary.subtotal || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer with Navigation Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-4">
          <div className="flex justify-between space-x-3">
            <button
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1) {
                    if (validateAddress()) {
                      setStep(2);
                    } else {
                      error('Please fill in all required fields');
                    }
                  } else {
                    setStep(3);
                  }
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors flex-1 sm:flex-none"
              >
                {step === 1 ? 'Continue to Payment' : 'Review Order'}
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Cart;

