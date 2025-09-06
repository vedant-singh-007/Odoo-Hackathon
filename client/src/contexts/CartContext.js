import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  isUpdating: false,
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_UPDATING: 'SET_UPDATING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  UPDATE_TOTALS: 'UPDATE_TOTALS',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CART_ACTIONS.SET_UPDATING:
      return {
        ...state,
        isUpdating: action.payload,
      };

    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        isLoading: false,
      };

    case CART_ACTIONS.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === action.payload.productId
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload.item];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.product.price * item.quantity), 0),
        isUpdating: false,
      };

    case CART_ACTIONS.UPDATE_ITEM:
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: updatedItems.reduce((total, item) => total + (item.product.price * item.quantity), 0),
        isUpdating: false,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(
        item => item.product._id !== action.payload.productId
      );

      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: filteredItems.reduce((total, item) => total + (item.product.price * item.quantity), 0),
        isUpdating: false,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isUpdating: false,
      };

    case CART_ACTIONS.UPDATE_TOTALS:
      return {
        ...state,
        totalItems: state.items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch cart on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated]);

  // Fetch cart from API
  const fetchCart = async () => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await cartAPI.getCart();
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response.data.cart,
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Add item to cart
  const addItem = async (productId, quantity = 1, notes = '') => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: true });

    try {
      const response = await cartAPI.addItem(productId, quantity, notes);
      
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: {
          productId,
          quantity,
          item: response.data.cart.items.find(
            item => item.product._id === productId
          ),
        },
      });

      toast.success('Item added to cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: false });
      return { success: false, error: message };
    }
  };

  // Update item quantity
  const updateItemQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please login to update cart');
      return { success: false };
    }

    dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: true });

    try {
      await cartAPI.updateItemQuantity(productId, quantity);
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM,
        payload: { productId, quantity },
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update item quantity';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: false });
      return { success: false, error: message };
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to remove items from cart');
      return { success: false };
    }

    dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: true });

    try {
      await cartAPI.removeItem(productId);
      
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { productId },
      });

      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: false });
      return { success: false, error: message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: true });

    try {
      await cartAPI.clearCart();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.SET_UPDATING, payload: false });
      return { success: false, error: message };
    }
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Get cart count
  const getCartCount = () => {
    return state.totalItems;
  };

  // Calculate totals (useful for local updates)
  const calculateTotals = () => {
    dispatch({ type: CART_ACTIONS.UPDATE_TOTALS });
  };

  const value = {
    ...state,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    fetchCart,
    isInCart,
    getItemQuantity,
    getCartCount,
    calculateTotals,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
