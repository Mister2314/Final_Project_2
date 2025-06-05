import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

const initialState = {
  orders: [],
  userOrders: [],
  statistics: null,
  loading: false,
  error: null,
  currentOrder: null
};

const generateDeliveryDate = () => {
  const now = new Date();
  const minDays = 1;
  const maxDays = 7;
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const deliveryDate = new Date(now.getTime() + (randomDays * 24 * 60 * 60 * 1000));
  return deliveryDate.toISOString().split('T')[0]; 
};

const getProductsWithDetails = async (products) => {
  try {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    const productIds = products.map(p => p.id).filter(id => id);
    
    if (productIds.length === 0) {
      return [];
    }

    const { data: productDetails, error } = await supabase
      .from('products')
      .select('id, main_name, main_category, image, price')
      .in('id', productIds);

    if (error) {
      console.error('Error fetching product details:', error);
      return products;
    }

    return products.map(orderProduct => {
      const productDetail = productDetails.find(p => p.id === orderProduct.id);
      return {
        ...orderProduct,
        main_name: productDetail?.main_name || orderProduct.main_name || orderProduct.name || '',
        main_category: productDetail?.main_category || orderProduct.main_category || '',
        name: orderProduct.name || productDetail?.main_name || '',
        price: parseFloat(orderProduct.price || productDetail?.price) || 0,
        current_price: parseFloat(productDetail?.price || orderProduct.price) || 0,
        quantity: parseInt(orderProduct.quantity) || 1,
        image: orderProduct.image || productDetail?.image || ''
      };
    });
  } catch (error) {
    console.error('Error in getProductsWithDetails:', error);
    return products;
  }
};

const normalizeOrderData = async (order) => {
  if (!order) return null;
  
  const normalizedProducts = await getProductsWithDetails(
    Array.isArray(order.products) ? order.products : []
  );

  // Normalize status to lowercase English keys
  const normalizeStatus = (status) => {
    const statusMap = {
      'sifarişiniz hazırlanır': 'processing',
      'yolda': 'inTransit',
      'çatdırıldı': 'delivered',
      'ləğv edildi': 'cancelled',
      'geri qaytarıldı': 'returned',
      'təsdiq edildi': 'confirmed',
      'ödəniş gözləyir': 'waitingPayment',
      'Sifarişiniz hazırlanır': 'processing',
      'Yolda': 'inTransit',
      'Çatdırıldı': 'delivered',
      'Ləğv edildi': 'cancelled',
      'Geri qaytarıldı': 'returned',
      'Təsdiq edildi': 'confirmed',
      'Ödəniş gözləyir': 'waitingPayment'
    };
    return statusMap[status?.toLowerCase()] || 'processing';
  };

  return {
    ...order,
    products: normalizedProducts,
    total_price: parseFloat(order.total_price) || 0,
    status: normalizeStatus(order.status),
    created_at: order.created_at || new Date().toISOString(),
    updated_at: order.updated_at || new Date().toISOString(),
    user_id: order.user_id || null,
    full_name: order.full_name || '',
    shipping_address: order.shipping_address || '',
    shipping_city: order.shipping_city || '',
    shipping_zip: order.shipping_zip || '',
    delivery_date: order.delivery_date || null,
    expected_delivery_date: order.expected_delivery_date || null
  };
};

const calculateOrderTotal = (products, coupon = null) => {
  const subtotal = Math.round(products.reduce((sum, p) => 
    sum + (p.price * p.quantity), 0) * 100) / 100;

  if (!coupon) return subtotal;

  const discountAmount = (subtotal * coupon.percentage) / 100;
  return Math.round((subtotal - discountAmount) * 100) / 100;
};

export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const normalizedOrders = await Promise.all(
        (data || []).map(order => normalizeOrderData(order))
      );
      
      return normalizedOrders.filter(Boolean);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const normalizedOrders = await Promise.all(
        (data || []).map(order => normalizeOrderData(order))
      );
      
      return normalizedOrders.filter(Boolean);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return rejectWithValue(error.message || 'Failed to fetch user orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async ({ orderData, coupon }, { rejectWithValue }) => {
    try {
      // Basic validation
      if (!orderData?.user_id || !orderData?.products?.length) {
        console.error('Invalid order data:', orderData);
        throw new Error('Invalid order data');
      }

      // Prepare the order data for Supabase
      const orderForDb = {
        user_id: orderData.user_id,
        products: orderData.products.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: parseFloat(product.price),
          quantity: parseInt(product.quantity)
        })),
        total_price: parseFloat(orderData.total_price),
        full_name: orderData.full_name,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_zip: orderData.shipping_zip,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expected_delivery_date: generateDeliveryDate()
      };

      // Validate the data before sending to Supabase
      if (isNaN(orderForDb.total_price)) {
        console.error('Invalid total price:', orderData.total_price);
        throw new Error('Invalid total price');
      }

      if (!orderForDb.products.every(p => p.id && !isNaN(p.price) && !isNaN(p.quantity))) {
        console.error('Invalid product data:', orderForDb.products);
        throw new Error('Invalid product data');
      }

      console.log('Sending order to Supabase:', orderForDb);

      const { data, error } = await supabase
        .from('orders')
        .insert([orderForDb])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from order creation');
      }

      console.log('Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, orderData }, { rejectWithValue }) => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      let updateData = {
        ...(orderData || {}),
        updated_at: new Date().toISOString()
      };

      if (status) {
        updateData.status = status;
      }

      if (updateData.products?.length) {
        updateData.products = await getProductsWithDetails(updateData.products);
        updateData.total_price = Math.round(updateData.products.reduce((sum, p) => 
          sum + (p.price * p.quantity), 0) * 100) / 100;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      
      return await normalizeOrderData(data);
    } catch (error) {
      console.error('Error updating order:', error);
      return rejectWithValue(error.message || 'Failed to update order');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return orderId;
    } catch (error) {
      console.error('Error deleting order:', error);
      return rejectWithValue(error.message || 'Failed to delete order');
    }
  }
);

export const calculateOrderStatistics = createAsyncThunk(
  'orders/calculateStatistics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const orders = getState().orders.orders;
      if (!orders || !Array.isArray(orders)) {
        throw new Error('No orders data available');
      }

      const validOrders = orders.filter(order => order && typeof order === 'object');

      const categoryStats = validOrders.reduce((acc, order) => {
        if (!order.products || !Array.isArray(order.products)) return acc;
        
        order.products.forEach(product => {
          if (!product || typeof product !== 'object') return;
          
          if (!product.main_category || product.main_category.trim() === '') return;
          
          const category = product.main_category.trim();
          const quantity = parseInt(product.quantity) || 1;
          const price = parseFloat(product.price || product.current_price) || 0;
          
          if (!acc[category]) {
            acc[category] = { count: 0, revenue: 0 };
          }
          acc[category].count += quantity;
          acc[category].revenue += price * quantity;
        });
        return acc;
      }, {});

      const formattedCategoryStats = Object.entries(categoryStats)
        .filter(([category]) => category && category.trim() !== '')
        .map(([category, stats]) => ({
          category,
          count: stats.count,
          revenue: Math.round(stats.revenue * 100) / 100
        }))
        .sort((a, b) => b.count - a.count);

      const statistics = {
        totalOrders: validOrders.length,
        totalRevenue: Math.round(validOrders.reduce((sum, order) => {
          const price = parseFloat(order.total_price) || 0;
          return sum + price;
        }, 0) * 100) / 100,
        statusStats: Object.entries(
          validOrders.reduce((acc, order) => {
            const status = order.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {})
        ).map(([status, count]) => ({ status, count })),
        categoryStats: formattedCategoryStats,
        monthlyStats: Object.entries(
          validOrders.reduce((acc, order) => {
            try {
              const date = new Date(order.created_at);
              const month = date.toLocaleString('en-US', { month: 'long' });
              if (!acc[month]) {
                acc[month] = { orders: 0, revenue: 0 };
              }
              acc[month].orders++;
              acc[month].revenue += parseFloat(order.total_price) || 0;
              return acc;
            } catch (error) {
              console.error('Error processing order date:', error);
              return acc;
            }
          }, {})
        ).map(([month, stats]) => ({ 
          month, 
          orders: stats.orders,
          revenue: Math.round(stats.revenue * 100) / 100
        })),
        recentCustomers: validOrders
          .reduce((acc, order) => {
            const userId = order.user_id;
            const userName = order.full_name || order.user_name || 'Unknown';
            
            if (!userId) return acc;
            
            const existingCustomer = acc.find(c => c.userId === userId);
            const products = Array.isArray(order.products) ? order.products : [];
            const totalProducts = products.reduce((sum, p) => {
              return sum + (parseInt(p.quantity) || 1);
            }, 0);
            
            if (existingCustomer) {
              existingCustomer.orderCount++;
              existingCustomer.totalProducts += totalProducts;
              existingCustomer.totalSpent += parseFloat(order.total_price) || 0;
              if (new Date(order.created_at) > new Date(existingCustomer.lastOrderDate)) {
                existingCustomer.lastOrderDate = order.created_at;
              }
            } else {
              acc.push({
                userId: userId,
                userName: userName,
                orderCount: 1,
                totalProducts: totalProducts,
                totalSpent: parseFloat(order.total_price) || 0,
                lastOrderDate: order.created_at
              });
            }
            return acc;
          }, [])
          .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate))
          .slice(0, 5)
          .map(customer => ({
            ...customer,
            totalSpent: Math.round(customer.totalSpent * 100) / 100
          }))
      };

      return statistics;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return rejectWithValue(error.message || 'Failed to calculate statistics');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateOrderStatusLocally: (state, action) => {
      const { orderId, status, deliveryDate } = action.payload;
      
      if (!orderId) return;
      
      const orderIndex = state.orders.findIndex(order => order && order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = {
          ...state.orders[orderIndex],
          status: status || state.orders[orderIndex].status,
          ...(deliveryDate && { delivery_date: deliveryDate })
        };
      }
      
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder = {
          ...state.currentOrder,
          status: status || state.currentOrder.status,
          ...(deliveryDate && { delivery_date: deliveryDate })
        };
      }
    },
    updateExpectedDeliveryDateLocally: (state, action) => {  
      const { orderId, expectedDeliveryDate } = action.payload;
      
      if (!orderId || !expectedDeliveryDate) return;
      
      const orderIndex = state.orders.findIndex(order => order && order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = {
          ...state.orders[orderIndex],
          expected_delivery_date: expectedDeliveryDate
        };
      }
      
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder = {
          ...state.currentOrder,
          expected_delivery_date: expectedDeliveryDate
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        state.error = null;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch orders');
      })

      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload || [];
        state.error = null;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch user orders');
      })

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.orders.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.orders.findIndex(order => order && order.id === action.payload.id);
          if (index !== -1) {
            state.orders[index] = action.payload;
          }
        }
        state.error = null;
        toast.success('Order updated successfully');
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to update order');
      })

      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order && order.id !== action.payload);
        state.error = null;
        toast.success('Order deleted successfully');
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to delete order');
      })

      .addCase(calculateOrderStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateOrderStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(calculateOrderStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to calculate statistics');
      });
  }
});

export const { 
  clearError, 
  setCurrentOrder, 
  clearCurrentOrder, 
  updateOrderStatusLocally, 
  updateExpectedDeliveryDateLocally 
} = ordersSlice.actions;

export default ordersSlice.reducer;