import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

const initialState = {
  products: [],
  loading: false,
  error: null,
  filters: {
    main_name: '',
    main_category: '',
    isDiscount: undefined,
    instock: undefined,
  },
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.main_name && typeof filters.main_name === 'string' && filters.main_name.trim() !== '') {
        query = query.eq('main_name', filters.main_name.trim());
      }

      if (filters.main_category) {
        if (Array.isArray(filters.main_category)) {
          query = query.in('main_category', filters.main_category);
        } else if (typeof filters.main_category === 'string' && filters.main_category.trim() !== '') {
          query = query.eq('main_category', filters.main_category.trim().toLowerCase());
        }
      }

      if (filters.isDiscount !== null && filters.isDiscount !== undefined) {
        query = query.eq('isDiscount', filters.isDiscount);
      }

      if (filters.instock !== null && filters.instock !== undefined) {
        query = query.eq('instock', filters.instock);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fetch products error:', error);
      return rejectWithValue(error.message || 'Məhsulları yükləmək mümkün olmadı');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      if (!productData || Object.keys(productData).length === 0) {
        throw new Error('Məhsul məlumatları boş ola bilməz');
      }

      const requiredFields = ['main_name', 'price'];
      for (const field of requiredFields) {
        if (!productData[field] && productData[field] !== 0) {
          throw new Error(`${field} sahəsi tələb olunur`);
        }
      }

      const productWithDefaults = {
        ...productData,
        instock: productData.instock !== undefined ? productData.instock : true,
        isDiscount: productData.isDiscount !== undefined ? productData.isDiscount : false,
        discount: productData.discount || 0,
        main_category: productData.main_category || 'Digər'
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productWithDefaults])
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Məhsul yaradılmadı');
      }

      return data[0];
    } catch (error) {
      console.error('Create product error:', error);
      return rejectWithValue(error.message || 'Məhsul yaratmaq mümkün olmadı');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Məhsul ID-si tələb olunur');
      }
      if (!productData || Object.keys(productData).length === 0) {
        throw new Error('Yeniləmək üçün məlumat tələb olunur');
      }

      const cleanedData = {};
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          if (productData[key] === '' && ['discount'].includes(key)) {
            cleanedData[key] = 0;
          } else {
            cleanedData[key] = productData[key];
          }
        }
      });

      if (Object.keys(cleanedData).length === 0) {
        throw new Error('Yeniləmək üçün düzgün məlumat tapılmadı');
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingProduct) {
        throw new Error('Məhsul tapılmadı');
      }

      const { data, error } = await supabase
        .from('products')
        .update(cleanedData)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Məhsul yenilənmədi');
      }

      return data[0];
    } catch (error) {
      console.error('Update product error:', error);
      return rejectWithValue(error.message || 'Məhsulu yeniləmək mümkün olmadı');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Məhsul ID-si tələb olunur');
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingProduct) {
        throw new Error('Məhsul tapılmadı');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    } catch (error) {
      console.error('Delete product error:', error);
      return rejectWithValue(error.message || 'Məhsulu silmək mümkün olmadı');
    }
  }
);

export const getAllProducts = createAsyncThunk(
  'products/getAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get all products error:', error);
      return rejectWithValue(error.message || 'Bütün məhsulları yükləmək mümkün olmadı');
    }
  }
);

export const updateProductStock = createAsyncThunk(
  'products/updateProductStock',
  async ({ id, instock }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Məhsul ID-si tələb olunur');
      }

      if (typeof instock !== 'boolean') {
        throw new Error('Stock dəyəri boolean olmalıdır');
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingProduct) {
        throw new Error('Məhsul tapılmadı');
      }

      const { data, error } = await supabase
        .from('products')
        .update({ instock })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Məhsul stoku yenilənmədi');
      }

      return data[0];
    } catch (error) {
      console.error('Update product stock error:', error);
      return rejectWithValue(error.message || 'Məhsul stoku yeniləmək mümkün olmadı');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        main_name: '',
        main_category: '',
        isDiscount: undefined,
        instock: undefined,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    addProduct: (state, action) => {
      state.products.unshift(action.payload);
    },
    replaceProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    updateProductStockLocal: (state, action) => {
      const { id, instock } = action.payload;
      const index = state.products.findIndex(p => p.id === id);
      if (index !== -1) {
        state.products[index].instock = instock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateProductStock.pending, (state) => {
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  addProduct, 
  replaceProduct, 
  removeProduct,
  updateProductStockLocal
} = productSlice.actions;

export default productSlice.reducer;