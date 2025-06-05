import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Spinner from "../Spinner/Spinner";
import toast from "react-hot-toast";
import styles from "./AdminPanel.module.css";
import OrderStatistics from "./Tables/OrderStatistics/OrderStatistics";
import ProductsTable from './Tables/ProductsTable';
import BlogsTable from './Tables/BlogsTable';
import UsersTable from './Tables/UsersTable';
import OrdersTable from './Tables/OrdersTable';
import OrderForm from './Tables/OrderForm';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "../../redux/slices/productSlices";
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../../redux/slices/blogSlice";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../redux/slices/ordersSlice";

import { supabase } from "../../supabaseClient";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const AdminPanel = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const { products, loading: productsLoading } = useSelector(
    (state) => state.products
  );
  const { blogs, loading: blogsLoading } = useSelector((state) => state.blogs);
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("statistics");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [productCategories, setProductCategories] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);

const [productForm, setProductForm] = useState({
  main_name: "",
  nameAz: "",
  nameEn: "",
  descriptionAz: "",
  descriptionEn: "",
  image: "",
  main_category: "",
  price: "",
  isDiscount: false,
  discount: "",
  instock: true,
});

  const [blogForm, setBlogForm] = useState({
    blogTitle_az: "",
    blogTitle_en: "",
    blogDescription_az: "",
    blogDescription_en: "",
    blogCategory: "",
    image: "",
  });

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    username: "",
    role: "default",
  });

  const [orderForm, setOrderForm] = useState({
    user_id: "",
    full_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_zip: "",
    products: [],
    total_price: 0,
    status: "Sifarişiniz hazırlanır",
    created_at: new Date().toISOString(),
    expected_delivery_date: null,
    delivery_date: null
  });

  const [productFilter, setProductFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const getCurrentPageData = (data) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1); 
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(fetchBlogs());
    dispatch(getAllOrders());
    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueProductCategories = [
        ...new Set(
          products
            .map((product) => product.main_category)
            .filter((category) => category && category.trim() !== "")
        ),
      ].sort();
      setProductCategories(uniqueProductCategories);
    }
  }, [products]);

  useEffect(() => {
    if (blogs && blogs.length > 0) {
      const uniqueBlogCategories = [
        ...new Set(
          blogs
            .map((blog) => blog.blogCategory)
            .filter((category) => category && category.trim() !== "")
        ),
      ].sort();
      setBlogCategories(uniqueBlogCategories);
    }
  }, [blogs]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, username, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch users: " + error.message);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };
const openModal = (type, action, item = null) => {
  setModalType(type);
  setModalAction(action);
  setSelectedItem(item);
  setShowModal(true);

  if (action === "edit" && item) {
    if (type === "product") {
      setProductForm({
        main_name: item.main_name || "",
        nameAz: item.nameAz || "",
        nameEn: item.nameEn || "",
        descriptionAz: item.descriptionAz || "",
        descriptionEn: item.descriptionEn || "",
        image: item.image || "",
        main_category: item.main_category || "",
        price: item.price ? item.price.toString() : "",
        isDiscount: Boolean(item.isDiscount),
        discount: item.discount && item.discount > 0 ? item.discount.toString() : "",
        instock: Boolean(item.instock !== undefined ? item.instock : true),
      });
    } else if (type === "blog") {
      setBlogForm({
        blogTitle_az: item.blogTitle_az || "",
        blogTitle_en: item.blogTitle_en || "",
        blogDescription_az: item.blogDescription_az || "",
        blogDescription_en: item.blogDescription_en || "",
        blogCategory: item.blogCategory || "",
        image: item.image || "",
      });
    } else if (type === "user") {
      setUserForm({
        email: item.email || "",
        password: "",
        username: item.username || "",
        role: item.role || "default",
      });
    } else if (type === "order") {
      setOrderForm({
        user_id: item.user_id || "",
        full_name: item.full_name || "",
        shipping_address: item.shipping_address || "",
        shipping_city: item.shipping_city || "",
        shipping_zip: item.shipping_zip || "",
        products: item.products || [],
        total_price: item.total_price || 0,
        status: item.status || "Sifarişiniz hazırlanır",
        created_at: item.created_at || new Date().toISOString(),
        expected_delivery_date: item.expected_delivery_date || null,
        delivery_date: item.delivery_date || null
      });
    }
  } else {
    if (type === "order") {
      setOrderForm({
        user_id: "",
        full_name: "",
        shipping_address: "",
        shipping_city: "",
        shipping_zip: "",
        products: [],
        total_price: 0,
        status: "Sifarişiniz hazırlanır",
        created_at: new Date().toISOString(),
        expected_delivery_date: null,
        delivery_date: null
      });
    }
    setProductForm({
      main_name: "",
      nameAz: "",
      nameEn: "",
      descriptionAz: "",
      descriptionEn: "",
      image: "",
      main_category: "",
      price: "",
      isDiscount: false,
      discount: "",
      instock: true,
    });
    setBlogForm({
      blogTitle_az: "",
      blogTitle_en: "",
      blogDescription_az: "",
      blogDescription_en: "",
      blogCategory: "",
      image: "",
    });
    setUserForm({
      email: "",
      password: "",
      username: "",
      role: "default",
    });
  }
};


  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setModalAction("");
    setSelectedItem(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    if (modalType === "product") {
      const productData = { ...productForm };
      
      if (!productData.main_name.trim()) {
        toast.error("Animal type (main_name) is required", { id: 'product-validation' });
        return;
      }

      if (!productData.nameAz.trim()) {
        toast.error("Product name (AZ) is required", { id: 'product-validation' });
        return;
      }

      if (!productData.nameEn.trim()) {
        toast.error("Product name (EN) is required", { id: 'product-validation' });
        return;
      }

      if (!productData.main_category.trim()) {
        toast.error("Category is required", { id: 'product-validation' });
        return;
      }

      if (!productData.price || parseFloat(productData.price) <= 0) {
        toast.error("Price must be greater than 0", { id: 'product-validation' });
        return;
      }

      productData.price = Math.round(parseFloat(productData.price) * 100) / 100;
      productData.isDiscount = Boolean(productData.isDiscount);
      productData.instock = Boolean(productData.instock);

      if (productData.isDiscount) {
        if (!productData.discount || productData.discount.toString().trim() === "") {
          toast.error("Discount percentage is required when discount is enabled", { id: 'product-validation' });
          return;
        }
        
        const discountValue = parseFloat(productData.discount);
        if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
          toast.error("Discount must be a number between 0 and 100", { id: 'product-validation' });
          return;
        }
        
        productData.discount = discountValue;
      } else {
        productData.discount = 0;
      }

      Object.keys(productData).forEach(key => {
        if (productData[key] === '' && !['main_name', 'nameAz', 'nameEn', 'main_category'].includes(key)) {
          delete productData[key];
        }
      });
      
      if (modalAction === "create") {
        await dispatch(createProduct(productData)).unwrap();
        toast.success("Product created successfully");
      } else {
        if (!selectedItem || !selectedItem.id) {
          toast.error("Product ID is missing", { id: 'product-validation' });
          return;
        }
        
        await dispatch(updateProduct({ id: selectedItem.id, productData })).unwrap();
        toast.success("Product updated successfully");
      }

      await dispatch(getAllProducts());
      
    } else if (modalType === "blog") {
      if (!blogForm.blogTitle_az.trim()) {
        toast.error("Blog title (AZ) is required", { id: 'blog-validation' });
        return;
      }

      if (!blogForm.blogTitle_en.trim()) {
        toast.error("Blog title (EN) is required", { id: 'blog-validation' });
        return;
      }

      if (!blogForm.blogDescription_az.trim()) {
        toast.error("Blog description (AZ) is required", { id: 'blog-validation' });
        return;
      }

      if (!blogForm.blogDescription_en.trim()) {
        toast.error("Blog description (EN) is required", { id: 'blog-validation' });
        return;
      }

      if (!blogForm.blogCategory.trim()) {
        toast.error("Blog category is required", { id: 'blog-validation' });
        return;
      }

      if (modalAction === "create") {
        await dispatch(createBlog(blogForm)).unwrap();
        toast.success("Blog created successfully");
      } else {
        if (!selectedItem || !selectedItem.id) {
          toast.error("Blog ID is missing", { id: 'blog-validation' });
          return;
        }
        
        await dispatch(updateBlog({ id: selectedItem.id, blogData: blogForm })).unwrap();
        toast.success("Blog updated successfully");
      }

      await dispatch(fetchBlogs());
      
    } else if (modalType === "user") {
      if (!userForm.username.trim()) {
        toast.error(t('adminPanel.forms.user.validation.usernameRequired'), { id: 'user-validation' });
        return;
      }

      if (!userForm.email.trim()) {
        toast.error(t('adminPanel.forms.user.validation.emailRequired'), { id: 'user-validation' });
        return;
      }

      if (modalAction === "create") {
        if (!userForm.password.trim()) {
          toast.error(t('adminPanel.forms.user.validation.passwordRequired'), { id: 'user-validation' });
          return;
        }

        if (userForm.password.length < 6) {
          toast.error(t('adminPanel.forms.user.validation.passwordMinLength'), { id: 'user-validation' });
          return;
        }

        const { error } = await supabase
          .from("users")
          .insert([{
            email: userForm.email,
            password: userForm.password,
            username: userForm.username,
            role: userForm.role,
          }])
          .select()
          .single();

        if (error) throw error;
        toast.success(t('adminPanel.forms.user.messages.createSuccess'));
        fetchUsers();
      } else {
        if (!selectedItem || !selectedItem.id) {
          toast.error(t('adminPanel.forms.user.validation.userIdMissing'), { id: 'user-validation' });
          return;
        }

        const updateData = {
          email: userForm.email,
          username: userForm.username,
          role: userForm.role,
        };

        if (userForm.password.trim()) {
          if (userForm.password.length < 6) {
            toast.error(t('adminPanel.forms.user.validation.passwordMinLength'), { id: 'user-validation' });
            return;
          }
          updateData.password = userForm.password;
        }

        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", selectedItem.id)
          .select()
          .single();

        if (error) throw error;
        toast.success(t('adminPanel.forms.user.messages.updateSuccess'));
        fetchUsers();
      }
    } else if (modalType === "order") {
      if (!orderForm.user_id) {
        toast.error("Customer is required", { id: 'order-validation' });
        return;
      }

      if (!orderForm.full_name || !orderForm.full_name.trim()) {
        toast.error("Full name is required", { id: 'order-validation' });
        return;
      }

      if (!orderForm.shipping_address || !orderForm.shipping_address.trim()) {
        toast.error("Shipping address is required", { id: 'order-validation' });
        return;
      }

      if (!orderForm.shipping_city || !orderForm.shipping_city.trim()) {
        toast.error("City is required", { id: 'order-validation' });
        return;
      }

      if (!orderForm.shipping_zip || !orderForm.shipping_zip.trim()) {
        toast.error("ZIP code is required", { id: 'order-validation' });
        return;
      }

      if (orderForm.products.length === 0) {
        toast.error("No products selected", { id: 'order-validation' });
        return;
      }

      if (orderForm.status === "Çatdırıldı" && !orderForm.delivery_date) {
        toast.error("Delivery date is required for delivered orders", { id: 'order-validation' });
        return;
      }

      if (!["Ləğv edildi", "Geri qaytarıldı"].includes(orderForm.status) && !orderForm.expected_delivery_date) {
        toast.error("Expected delivery date is required", { id: 'order-validation' });
        return;
      }

      try {
        const orderData = {
          ...orderForm,
          full_name: orderForm.full_name.trim(),
          shipping_address: orderForm.shipping_address.trim(),
          shipping_city: orderForm.shipping_city.trim(),
          shipping_zip: orderForm.shipping_zip.trim(),
          updated_at: new Date().toISOString()
        };

        if (modalAction === "create") {
          await dispatch(createOrder(orderData)).unwrap();
          toast.success("Order created successfully");
        } else {
          if (!selectedItem || !selectedItem.id) {
            toast.error("Order ID is missing", { id: 'order-validation' });
            return;
          }

          await dispatch(updateOrderStatus({
            orderId: selectedItem.id,
            status: orderData.status,
            orderData
          })).unwrap();
          toast.success("Order updated successfully");
        }

        await dispatch(getAllOrders());
        closeModal();
      } catch (error) {
        console.error('Order operation error:', error);
        toast.error("Failed to update order");
      }
    }

    closeModal();
  } catch (error) {
    console.error('Submit error:', error);
    toast.error("Failed to submit form");
  }
};

  const handleDelete = (type, id) => {
    const getDeleteConfig = () => {
      switch (type) {
        case 'blog':
          return {
            title: t('adminPanel.delete.blog.title'),
            message: t('adminPanel.delete.blog.message'),
            action: async () => {
              await dispatch(deleteBlog(id)).unwrap();
              await dispatch(fetchBlogs());
            }
          };
        case 'product':
          return {
            title: t('adminPanel.delete.product.title'),
            message: t('adminPanel.delete.product.message'),
            action: async () => {
              await dispatch(deleteProduct(id)).unwrap();
              await dispatch(getAllProducts());
            }
          };
        case 'user':
          return {
            title: t('adminPanel.delete.user.title'),
            message: t('adminPanel.delete.user.message'),
            action: async () => {
              const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);
              if (error) throw error;
              await fetchUsers();
            }
          };
        case 'order':
          return {
            title: t('adminPanel.delete.order.title'),
            message: t('adminPanel.delete.order.message'),
            action: async () => {
              await dispatch(deleteOrder(id)).unwrap();
              await dispatch(getAllOrders());
            }
          };
        default:
          return null;
      }
    };

    const config = getDeleteConfig();
    if (!config) return;

    if (!confirmDialog.isOpen) {
      setConfirmDialog({
        isOpen: true,
        title: config.title,
        message: config.message,
        onConfirm: async () => {
          try {
            await config.action();
            toast.success(t(`adminPanel.delete.${type}.success`));
          } catch (error) {
            toast.error(t(`adminPanel.delete.${type}.error`));
            console.error(`Error deleting ${type}:`, error);
          } finally {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    }
  };

  const handleInputChange = (form, field, value) => {
    if (form === "product") {
      setProductForm((prev) => {
        const newForm = { ...prev, [field]: value };
        
        if (field === "isDiscount" && !value) {
          newForm.discount = "";
        }
        
        return newForm;
      });
    } else if (form === "blog") {
      setBlogForm((prev) => ({ ...prev, [field]: value }));
    } else if (form === "user") {
      setUserForm((prev) => ({ ...prev, [field]: value }));
    } else if (form === "order") {
      setOrderForm((prev) => ({ ...prev, [field]: value }));
    }
  };

 const renderTable = () => {
  if (activeTab === "statistics") {
    return <OrderStatistics />;
  }

  let data = [];
  let loading = false;

  switch (activeTab) {
    case "products":
      data = products || [];
      loading = productsLoading;
      break;
    case "blogs":
      data = blogs || [];
      loading = blogsLoading;
      break;
    case "users":
      data = users || [];
      loading = usersLoading;
      break;
    case "orders":
      data = orders || [];
      loading = ordersLoading;
      break;
    default:
      data = [];
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="large" />
        <div className={styles.loadingText}>
          {t('adminPanel.loading', { type: t(`adminPanel.sections.${activeTab}`) })}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.emptyStateIcon}>📋</div>
        <div>{t('adminPanel.noData', { type: t(`adminPanel.sections.${activeTab}`) })}</div>
      </div>
    );
  }

  const currentPageData = getCurrentPageData(data);
  const emptyRows = itemsPerPage - currentPageData.length;

  return (
    <div>
      {activeTab === "products" && (
        <ProductsTable
          products={products}
          currentPageData={currentPageData}
          emptyRows={emptyRows}
          openModal={openModal}
          handleDelete={handleDelete}
        />
      )}
      
      {activeTab === "blogs" && (
        <BlogsTable
          currentPageData={currentPageData}
          emptyRows={emptyRows}
          openModal={openModal}
          handleDelete={handleDelete}
        />
      )}
      
      {activeTab === "users" && (
        <UsersTable
          currentPageData={currentPageData}
          emptyRows={emptyRows}
          openModal={openModal}
          handleDelete={handleDelete}
        />
      )}
      
      {activeTab === "orders" && (
        <OrdersTable
          currentPageData={currentPageData}
          emptyRows={emptyRows}
          openModal={openModal}
          handleDelete={handleDelete}
        />
      )}

      {getTotalPages(data) > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
          </div>
          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            {Array.from({ length: getTotalPages(data) }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`${styles.paginationButton} ${
                  currentPage === pageNumber ? styles.activePage : ''
                }`}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              className={`${styles.paginationButton} ${currentPage === getTotalPages(data) ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === getTotalPages(data)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div
        className={styles.modalOverlay}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {modalAction === "create" ? t('adminPanel.actions.create') : t('adminPanel.actions.edit')}
            </h2>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.modalBody}>
              {modalType === "order" ? (
                <OrderForm
                  orderForm={orderForm}
                  handleInputChange={handleInputChange}
                  products={products}
                  users={users}
                  handleProductQuantity={handleProductQuantity}
                  productFilter={productFilter}
                  setProductFilter={setProductFilter}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  productCategories={productCategories}
                />
              ) : modalType === "product" ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {t('adminPanel.forms.product.mainName')} *
                      <span className={styles.fieldHint}>
                        <small className={styles.fieldHintSmall}>
                          {t('adminPanel.forms.product.mainNameHint')}
                        </small>
                      </span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={productForm.main_name}
                      onChange={(e) =>
                        handleInputChange("product", "main_name", e.target.value)
                      }
                      placeholder={t('adminPanel.forms.product.mainName')}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.nameAz')} *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={productForm.nameAz}
                      onChange={(e) =>
                        handleInputChange("product", "nameAz", e.target.value)
                      }
                      placeholder={t('adminPanel.forms.product.nameAz')}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.nameEn')} *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={productForm.nameEn}
                      onChange={(e) =>
                        handleInputChange("product", "nameEn", e.target.value)
                      }
                      placeholder={t('adminPanel.forms.product.nameEn')}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.descriptionAz')}</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      value={productForm.descriptionAz}
                      onChange={(e) =>
                        handleInputChange(
                          "product",
                          "descriptionAz",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.descriptionEn')}</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      value={productForm.descriptionEn}
                      onChange={(e) =>
                        handleInputChange(
                          "product",
                          "descriptionEn",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.image')}</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={productForm.image}
                      onChange={(e) =>
                        handleInputChange("product", "image", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.category')} *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={productForm.main_category}
                      onChange={(e) =>
                        handleInputChange(
                          "product",
                          "main_category",
                          e.target.value
                        )
                      }
                      placeholder={t('adminPanel.forms.product.category')}
                      list="productCategoriesList"
                      required
                    />
                    <datalist id="productCategoriesList">
                      {productCategories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    {productCategories.length > 0 && (
                      <div className={styles.categoryHint}>
                        <small>
                          {t('adminPanel.forms.product.categoryHint')} {productCategories.join(", ")}
                        </small>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.product.price')} *</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={productForm.price}
                      onChange={(e) =>
                        handleInputChange("product", "price", e.target.value)
                      }
                      placeholder={t('adminPanel.forms.product.price')}
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <div className={styles.fieldHint}>
                      <small>
                        {t('adminPanel.forms.product.priceHint')}
                      </small>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="isDiscount"
                        className={styles.formCheckbox}
                        checked={productForm.isDiscount}
                        onChange={(e) =>
                          handleInputChange(
                            "product",
                            "isDiscount",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        htmlFor="isDiscount"
                        className={styles.checkboxLabel}
                      >
                        {t('adminPanel.forms.product.isDiscount')}
                        <span className={styles.optionalText}> ({t('adminPanel.forms.product.isDiscountHint')})</span>
                      </label>
                    </div>
                    <div className={styles.fieldHint}>
                      <small>
                        {t('adminPanel.forms.product.isDiscountHint')}
                      </small>
                    </div>
                  </div>

                  {/* Discount input - only show when isDiscount is true */}
                  {productForm.isDiscount && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        {t('adminPanel.forms.product.discountLabel')} *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className={styles.formInput}
                        value={productForm.discount}
                        onChange={(e) => handleInputChange("product", "discount", e.target.value)}
                        placeholder={t('adminPanel.forms.product.discountPlaceholder')}
                        required
                      />
                      <small className={styles.formHelp}>
                        {t('adminPanel.forms.product.discountHelp')}
                        </small>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="instock"
                        className={styles.formCheckbox}
                        checked={productForm.instock}
                        onChange={(e) =>
                          handleInputChange(
                            "product",
                            "instock",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        htmlFor="instock"
                        className={styles.checkboxLabel}
                      >
                        {t('adminPanel.forms.product.instock')}
                        <span className={styles.optionalText}> {t('adminPanel.forms.product.inStockDefault')}</span>
                      </label>
                    </div>
                    <div className={styles.fieldHint}>
                      <small>
                        {t('adminPanel.forms.product.instockHint')}
                      </small>
                    </div>
                  </div>
                </>
              ) : modalType === "blog" ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.blog.titleAz')}</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={blogForm.blogTitle_az}
                      onChange={(e) =>
                        handleInputChange("blog", "blogTitle_az", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.blog.titleEn')}</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={blogForm.blogTitle_en}
                      onChange={(e) =>
                        handleInputChange("blog", "blogTitle_en", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.blog.descriptionAz')}</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      value={blogForm.blogDescription_az}
                      onChange={(e) =>
                        handleInputChange(
                          "blog",
                          "blogDescription_az",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.blog.descriptionEn')}</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      value={blogForm.blogDescription_en}
                      onChange={(e) =>
                        handleInputChange(
                          "blog",
                          "blogDescription_en",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.blog.category')}</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={blogForm.blogCategory}
                      onChange={(e) =>
                        handleInputChange(
                          "blog",
                          "blogCategory",
                          e.target.value
                        )
                      }
                      placeholder={t('adminPanel.forms.blog.category')}
                      list="blogCategoriesList"
                      required
                    />
                    <datalist id="blogCategoriesList">
                      {blogCategories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    {blogCategories.length > 0 && (
                      <div className={styles.categoryHint}>
                        <small>
                          {t('adminPanel.forms.blog.categoryHint')} {blogCategories.join(", ")}
                        </small>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.blog.image')}</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={blogForm.image}
                      onChange={(e) =>
                        handleInputChange("blog", "image", e.target.value)
                      }
                    />
                  </div>
                </>
              ) : modalType === "user" ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.user.username')}</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={userForm.username}
                      onChange={(e) =>
                        handleInputChange("user", "username", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.user.email')}</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={userForm.email}
                      onChange={(e) =>
                        handleInputChange("user", "email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {t('adminPanel.forms.user.password')}
                      {modalAction === "edit" && (
                        <span className={styles.optionalText}>
                          ({t('adminPanel.forms.user.passwordHint')})
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      className={styles.formInput}
                      value={userForm.password}
                      onChange={(e) =>
                        handleInputChange("user", "password", e.target.value)
                      }
                      required={modalAction === "create"}
                      minLength="6"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('adminPanel.forms.user.role')}</label>
                    <select
                      className={styles.formSelect}
                      value={userForm.role}
                      onChange={(e) =>
                        handleInputChange("user", "role", e.target.value)
                      }
                      required
                    >
                      <option value="default">{t('adminPanel.forms.user.default')}</option>
                      <option value="admin">{t('adminPanel.forms.user.admin')}</option>
                    </select>
                  </div>
                </>
              ) : null}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
              >
                {t('adminPanel.actions.cancel')}
              </button>
              <button type="submit" className={styles.submitButton}>
                {modalAction === "create" ? t('adminPanel.actions.create') : t('adminPanel.actions.update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleProductQuantity = (productId, action) => {
    const productFromRedux = products.find(p => p.id === productId);
    
    if (!productFromRedux) {
      console.error('Product not found in Redux store:', productId);
      return;
    }

    setOrderForm(prev => {
      const currentProducts = [...prev.products];
      const productIndex = currentProducts.findIndex(p => p.id === productId);
      
      const product = productIndex === -1 ? {
        id: productId,
        quantity: 0,
        price: productFromRedux.price,
        name: productFromRedux.nameEn,
        main_name: productFromRedux.main_name,
        main_category: productFromRedux.main_category
      } : currentProducts[productIndex];

      let updatedProducts;
      if (action === "increase") {
        if (productIndex === -1) {
          updatedProducts = [...currentProducts, { ...product, quantity: 1 }];
        } else {
          updatedProducts = currentProducts.map(p => 
            p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
          );
        }
      } else if (action === "decrease") {
        if (product.quantity > 1) {
          updatedProducts = currentProducts.map(p =>
            p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
          );
        } else {
          updatedProducts = currentProducts.filter(p => p.id !== productId);
        }
      } else {
        updatedProducts = currentProducts;
      }

     const totalPrice = Math.round(updatedProducts.reduce((sum, p) => {
  const productInfo = products.find(prod => prod.id === p.id);
  return sum + (productInfo?.price || 0) * p.quantity;
}, 0) * 100) / 100;

      return {
        ...prev,
        products: updatedProducts,
        total_price: totalPrice
      };
    });
  };

  const renderProductSelection = () => {
    const filteredProducts = getFilteredProducts();
    
    return (
      <div className={styles.productSelectionContainer}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productSelectionItem}>
            <div className={styles.productInfo}>
              <img
                src={product.image}
                alt={product.nameEn}
                className={styles.productThumbnail}
              />
              <div className={styles.productDetails}>
                <div className={styles.productName}>{product.nameEn}</div>
                <div className={styles.productCategory}>{product.main_category}</div>
                <div className={styles.productPrice}>₼{Number(product.price).toFixed(2)}</div>
              </div>
            </div>
            <div className={styles.productQuantity}>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() => handleProductQuantity(product.id, "decrease")}
              >
                -
              </button>
              <span className={styles.quantityDisplay}>
                {orderForm.products.find(p => p.id === product.id)?.quantity || 0}
              </span>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() => handleProductQuantity(product.id, "increase")}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedProducts = () => {
    return (
      <div className={styles.selectedProducts}>
        {orderForm.products.map((product) => {
          const productInfo = products.find(p => p.id === product.id);
          const price = productInfo?.price || 0;
          const subtotal = price * product.quantity;
          
          return (
            <div key={product.id} className={styles.selectedProductItem}>
              <div className={styles.selectedProductInfo}>
                <span className={styles.selectedProductName}>
                  {productInfo?.nameEn || product.name}
                </span>
                <span className={styles.selectedProductQuantity}>
                  {product.quantity} × ₼{price.toFixed(2)}
                </span>
              </div>
              <div className={styles.selectedProductTotal}>
                ₼{subtotal.toFixed(2)}
              </div>
            </div>
          );
        })}
        {orderForm.products.length === 0 && (
          <div className={styles.emptySelection}>
            {t('adminPanel.forms.order.emptySelection')}
          </div>
        )}
      </div>
    );
  };

  const getFilteredProducts = () => {
    if (!products) return [];
    
    return products.filter(product => {
      const matchesSearch = product.nameEn.toLowerCase().includes(productFilter.toLowerCase()) ||
                           product.nameAz.toLowerCase().includes(productFilter.toLowerCase()) ||
                           product.main_name.toLowerCase().includes(productFilter.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.main_category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminWrapper}>
       <div className={styles.adminHeader}>
  <div className={styles.adminTitle}>
    <h1>{t('adminPanel.dashboard')}</h1>
  </div>

        </div>

       <div className={`${styles.tabsWrapper} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
  <div className={styles.sidebarHeader}>
    <h2 className={styles.sidebarTitle}>
      <span className={styles.sidebarIcon}>⚡</span>
      {t('adminPanel.title')}
    </h2>
  </div>
  
        <div className={styles.tabsContainer}>
   {[
  { key: "statistics", icon: "📊", label: t('adminPanel.sections.statistics') },
  { key: "products", icon: "📦", label: t('adminPanel.sections.products') },
  { key: "blogs", icon: "📝", label: t('adminPanel.sections.blogs') },
  { key: "users", icon: "👥", label: t('adminPanel.sections.users') },
  { key: "orders", icon: "🛍️", label: t('adminPanel.sections.orders') }
].map((tab) => (
      <button
        key={tab.key}
        className={`${styles.tabButton} ${
          activeTab === tab.key ? styles.activeTab : ""
        }`}
        onClick={() => handleTabChange(tab.key)}
      >
        <span className={styles.tabIcon}>{tab.icon}</span>
        {tab.label}
      </button>
    ))}
  </div>
        </div>
        <button 
  className={`${styles.mobileMenuButton} ${
    window.innerWidth <= 768 ? styles.mobileMenuButtonVisible : styles.mobileMenuButtonHidden
  }`}
  onClick={toggleMobileMenu}
>
  ☰
</button>

        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
  {activeTab === "statistics"
    ? "📊"
    : activeTab === "products"
    ? "📦"
    : activeTab === "blogs"
    ? "📝"
    : "👥"}
</span>
             {activeTab === "statistics" 
  ? t('statistics.orderStats') 
  : t(`adminPanel.management.${activeTab}`)
}
            </h2>
            {activeTab !== "statistics" && (
  <button
    className={styles.addButton}
    onClick={() => openModal(activeTab.slice(0, -1), "create")}
  >
    ➕ {t('adminPanel.actions.add')} 
  </button>
)}
          </div>

          {renderTable()}
        </div>

        {renderModal()}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default AdminPanel;
