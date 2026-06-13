import { useState, useCallback, createContext, useContext, useRef } from 'react';

/* ── Cart ──────────────────────────────────── */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = useCallback((product, qty = 1) => {
    setItems(prev => {
      const exist = prev.find(i => i.id === product.id);
      if (exist) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
  }, []);

  const remove = useCallback(id => setItems(prev => prev.filter(i => i.id !== id)), []);
  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const [cartCount, setCartCount] = useState(0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cartCount;

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

/* ── Auth ──────────────────────────────────── */
const AuthContext = createContext(null);

const loadUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [loggedIn, setLoggedIn] = useState(() => !!loadUser());
  const cartClearRef = useRef(null);

  const login = useCallback((userData) => {
    setUser(userData);
    setLoggedIn(true);
    sessionStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setLoggedIn(false);
    sessionStorage.removeItem('user');
    if (cartClearRef.current) cartClearRef.current();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loggedIn, login, logout, cartClearRef }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/* ── Toast ─────────────────────────────────── */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, show }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ── Wish ──────────────────────────────────── */
const WishContext = createContext(null);

export function WishProvider({ children }) {
  const [ids, setIds] = useState(new Set());
  const toggle = useCallback(id => {
    setIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <WishContext.Provider value={{ ids, toggle, has: id => ids.has(id) }}>
      {children}
    </WishContext.Provider>
  );
}

export const useWish = () => useContext(WishContext);