import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    SafeAreaView,
} from 'react-native';
import { apiService, Product, ProductsResponse } from '@/services/api';

export default function ProductsScreen() {
    const [ products, setProducts ] = useState<Product[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ refreshing, setRefreshing ] = useState(false);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ page, setPage ] = useState(1);
    const [ totalPages, setTotalPages ] = useState(1);
    const [ selectedProduct, setSelectedProduct ] = useState<Product | null>(null);
    const [ showProductModal, setShowProductModal ] = useState(false);
    const [ showCreateModal, setShowCreateModal ] = useState(false);
    const [ showEditModal, setShowEditModal ] = useState(false);
    const [ editProductData, setEditProductData ] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: ''
    });

    const fetchProducts = async () => {
        try {
            const response = await apiService.getProducts(page, 10, searchTerm);
            setProducts(response.products || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
            Alert.alert('Error', 'Failed to load products');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [ page, searchTerm ]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        setPage(1); // Reset to first page when searching
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    const handleDeleteProduct = (product: Product) => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.deleteProduct(product.id);
                            Alert.alert('Success', 'Product deleted successfully');
                            fetchProducts();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    },
                },
            ]
        );
    };

    const handleEditProduct = (product: Product) => {
        setEditProductData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock.toString(),
            category: product.category,
            brand: product.brand
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedProduct || !editProductData.name.trim()) {
            Alert.alert('Error', 'Please enter a valid product name');
            return;
        }

        try {
            // Note: This would need to be implemented with proper FormData
            Alert.alert('Info', 'Product edit functionality would be implemented here');
            setShowEditModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            Alert.alert('Error', 'Failed to update product');
        }
    };

    const handleAddProduct = () => {
        setShowCreateModal(true);
    };

    const getProductImageUrl = (imagePath: string) => {
        return apiService.getImageUrl(imagePath);
    };

    const renderProductCard = (product: Product) => (
        <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductPress(product)}
        >
            <View style={styles.productImageContainer}>
                {product.thumbnail ? (
                    <Image
                        source={{ uri: getProductImageUrl(product.thumbnail) }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>📦</Text>
                    </View>
                )}
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                </Text>

                <View style={styles.productDetails}>
                    <Text style={styles.productPrice}>₱{product.price}</Text>
                    {product.discount && product.discountPrice && (
                        <Text style={styles.productDiscountPrice}>
                            ₱{product.discountPrice}
                        </Text>
                    )}
                </View>

                <View style={styles.productMeta}>
                    <Text style={styles.productStock}>Stock: {product.stock}</Text>
                    <Text style={styles.productSold}>Sold: {product.sold}</Text>
                </View>

                <View style={styles.productFlags}>
                    {product.isNew && <Text style={styles.flag}>NEW</Text>}
                    {product.isBestSeller && <Text style={styles.flag}>BEST SELLER</Text>}
                    {product.isFeatured && <Text style={styles.flag}>FEATURED</Text>}
                </View>
            </View>

            <View style={styles.productActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleProductPress(product)}
                >
                    <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[ styles.actionButton, styles.deleteButton ]}
                    onPress={() => handleDeleteProduct(product)}
                >
                    <Text style={[ styles.actionButtonText, styles.deleteButtonText ]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[ styles.paginationButton, page === 1 && styles.paginationButtonDisabled ]}
                    onPress={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    <Text style={styles.paginationButtonText}>Previous</Text>
                </TouchableOpacity>

                <Text style={styles.paginationInfo}>
                    Page {page} of {totalPages}
                </Text>

                <TouchableOpacity
                    style={[ styles.paginationButton, page === totalPages && styles.paginationButtonDisabled ]}
                    onPress={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                >
                    <Text style={styles.paginationButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading products...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.title}>Products</Text>
                        <Text style={styles.subtitle}>Manage your product inventory</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddProduct}
                    >
                        <Text style={styles.addButtonText}>+ Add Product</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchTerm}
                    onChangeText={handleSearch}
                />
            </View>

            <ScrollView
                style={styles.productsContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {products.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No products found</Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Text style={styles.emptyStateButtonText}>Add your first product</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.productsGrid}>
                            {products.map(renderProductCard)}
                        </View>
                        {renderPagination()}
                    </>
                )}
            </ScrollView>

            {/* Product Detail Modal */}
            <Modal
                visible={showProductModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Product Details</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowProductModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedProduct && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.modalImageContainer}>
                                {selectedProduct.thumbnail ? (
                                    <Image
                                        source={{ uri: getProductImageUrl(selectedProduct.thumbnail) }}
                                        style={styles.modalImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.modalPlaceholderImage}>
                                        <Text style={styles.modalPlaceholderText}>📦</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.modalInfo}>
                                <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                                <Text style={styles.modalProductDescription}>{selectedProduct.description}</Text>

                                <View style={styles.modalDetails}>
                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Price:</Text>
                                        <Text style={styles.modalDetailValue}>₱{selectedProduct.price}</Text>
                                    </View>

                                    {selectedProduct.discount && selectedProduct.discountPrice && (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>Discount Price:</Text>
                                            <Text style={styles.modalDetailValue}>₱{selectedProduct.discountPrice}</Text>
                                        </View>
                                    )}

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Stock:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedProduct.stock}</Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Sold:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedProduct.sold}</Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Category:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedProduct.category}</Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Brand:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedProduct.brand}</Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Rating:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedProduct.rating} ⭐</Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Reviews:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedProduct.numReviews}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalFlags}>
                                    {selectedProduct.isNew && <Text style={styles.modalFlag}>NEW</Text>}
                                    {selectedProduct.isBestSeller && <Text style={styles.modalFlag}>BEST SELLER</Text>}
                                    {selectedProduct.isTopRated && <Text style={styles.modalFlag}>TOP RATED</Text>}
                                    {selectedProduct.isOnSale && <Text style={styles.modalFlag}>ON SALE</Text>}
                                    {selectedProduct.isTrending && <Text style={styles.modalFlag}>TRENDING</Text>}
                                    {selectedProduct.isHot && <Text style={styles.modalFlag}>HOT</Text>}
                                    {selectedProduct.isFeatured && <Text style={styles.modalFlag}>FEATURED</Text>}
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[ styles.modalActionButton, styles.editButton ]}
                                        onPress={() => {
                                            setShowProductModal(false);
                                            handleEditProduct(selectedProduct);
                                        }}
                                    >
                                        <Text style={styles.editButtonText}>✏️ Edit</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[ styles.modalActionButton, styles.deleteButton ]}
                                        onPress={() => {
                                            setShowProductModal(false);
                                            handleDeleteProduct(selectedProduct);
                                        }}
                                    >
                                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>

            {/* Create Product Modal - Placeholder */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Product</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowCreateModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.comingSoonText}>
                            Product creation form will be implemented here.
                        </Text>
                        <Text style={styles.comingSoonSubtext}>
                            This will include form fields for name, description, price, images, etc.
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: 'white',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    productsContainer: {
        flex: 1,
        padding: 16,
    },
    productsGrid: {
        gap: 16,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImageContainer: {
        width: '100%',
        height: 200,
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 48,
    },
    productInfo: {
        marginBottom: 12,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    productDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    productDiscountPrice: {
        fontSize: 14,
        color: '#10b981',
        marginLeft: 8,
        textDecorationLine: 'line-through',
    },
    productMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    productStock: {
        fontSize: 12,
        color: '#6b7280',
    },
    productSold: {
        fontSize: 12,
        color: '#6b7280',
    },
    productFlags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    flag: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    productActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    deleteButtonText: {
        color: 'white',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        marginTop: 16,
        borderRadius: 12,
    },
    paginationButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    paginationButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    paginationButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    paginationInfo: {
        fontSize: 14,
        color: '#6b7280',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 16,
    },
    emptyStateButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#6b7280',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalImageContainer: {
        width: '100%',
        height: 250,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    modalPlaceholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPlaceholderText: {
        fontSize: 64,
    },
    modalInfo: {
        gap: 16,
    },
    modalProductName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalProductDescription: {
        fontSize: 16,
        color: '#6b7280',
        lineHeight: 24,
    },
    modalDetails: {
        gap: 12,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalDetailLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    modalDetailValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
    },
    modalFlags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modalFlag: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalActionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#3b82f6',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    editButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    deleteButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    comingSoonText: {
        fontSize: 18,
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    comingSoonSubtext: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});
