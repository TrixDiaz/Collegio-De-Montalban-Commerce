import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    thumbnail: string;
    quantity: number;
    brand: string;
    category: string;
    stock: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [ items, setItems ] = useState<CartItem[]>([]);

    useEffect(() => {
        // Load cart from localStorage on mount
        const storedCart = localStorage.getItem('cart');
        console.log('Loading cart from localStorage:', storedCart);

        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                console.log('Parsed cart data:', parsedCart);

                // Validate and clean the cart data
                const validItems = parsedCart.filter((item: any) => {
                    // Check if item has basic required fields
                    if (!item || typeof item !== 'object' || !item.id || !item.name) {
                        console.warn('Removing invalid cart item - missing basic fields:', item);
                        return false;
                    }

                    // Ensure required fields exist with defaults
                    const cleanItem = {
                        id: item.id,
                        name: item.name,
                        price: typeof item.price === 'number' ? item.price : 0,
                        discountPrice: typeof item.discountPrice === 'number' ? item.discountPrice : undefined,
                        quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
                        thumbnail: item.thumbnail || '',
                        brand: item.brand || 'Unknown',
                        category: item.category || 'Unknown',
                        stock: typeof item.stock === 'number' ? item.stock : 1,
                    };

                    // Update the item in the array
                    Object.assign(item, cleanItem);

                    return true;
                });

                console.log('Valid cart items:', validItems);
                setItems(validItems);
            } catch (error) {
                console.error('Error parsing stored cart data:', error);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    useEffect(() => {
        // Save cart to localStorage whenever items change
        localStorage.setItem('cart', JSON.stringify(items));
    }, [ items ]);

    const addToCart = (product: Omit<CartItem, 'quantity'>) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                // If item exists, increase quantity
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // If item doesn't exist, add it with quantity 1
                return [ ...prevItems, { ...product, quantity: 1 } ];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => {
            const price = item.discountPrice || item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const value: CartContextType = {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
