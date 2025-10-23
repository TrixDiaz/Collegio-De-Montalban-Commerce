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
    KeyboardAvoidingView,
    Platform,
    FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ categories, setCategories ] = useState<Array<{ id: string, name: string }>>([]);
    const [ brands, setBrands ] = useState<Array<{ id: string, name: string }>>([]);
    const [ createProductData, setCreateProductData ] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        brandId: '',
        discount: false,
        discountPrice: '',
        isNew: true,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: false,
        isTrending: false,
        isHot: false,
        isFeatured: false,
    });
    const [ createThumbnail, setCreateThumbnail ] = useState<string | null>(null);
    const [ createImages, setCreateImages ] = useState<string[]>([]);
    const [ editProductData, setEditProductData ] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        brandId: '',
        discount: false,
        discountPrice: '',
        isNew: true,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: false,
        isTrending: false,
        isHot: false,
        isFeatured: false,
    });
    const [ editThumbnail, setEditThumbnail ] = useState<string | null>(null);
    const [ editImages, setEditImages ] = useState<string[]>([]);

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

    const fetchCategories = async () => {
        try {
            const response = await apiService.getCategories();
            setCategories(response || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await apiService.getBrands();
            setBrands(response || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, [ page, searchTerm ]);

    const pickThumbnail = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [ 1, 1 ],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCreateThumbnail(result.assets[ 0 ].uri);
        }
    };

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setCreateImages([ ...createImages, ...newImages ]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = createImages.filter((_, i) => i !== index);
        setCreateImages(newImages);
    };

    const pickEditThumbnail = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [ 1, 1 ],
            quality: 0.8,
        });

        if (!result.canceled) {
            setEditThumbnail(result.assets[ 0 ].uri);
        }
    };

    const pickEditImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setEditImages([ ...editImages, ...newImages ]);
        }
    };

    const removeEditImage = (index: number) => {
        const newImages = editImages.filter((_, i) => i !== index);
        setEditImages(newImages);
    };

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
            categoryId: product.categoryId,
            brandId: product.brandId,
            discount: product.discount,
            discountPrice: product.discountPrice || '',
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
            isTopRated: product.isTopRated,
            isOnSale: product.isOnSale,
            isTrending: product.isTrending,
            isHot: product.isHot,
            isFeatured: product.isFeatured,
        });
        setEditThumbnail(product.thumbnail ? apiService.getImageUrl(product.thumbnail) : null);
        setEditImages(product.images || []);
        setShowEditModal(true);
    };

    const resetCreateForm = () => {
        setCreateProductData({
            name: '',
            description: '',
            price: '',
            stock: '',
            categoryId: '',
            brandId: '',
            discount: false,
            discountPrice: '',
            isNew: true,
            isBestSeller: false,
            isTopRated: false,
            isOnSale: false,
            isTrending: false,
            isHot: false,
            isFeatured: false,
        });
        setCreateThumbnail(null);
        setCreateImages([]);
    };

    const handleCreateProduct = async () => {
        if (!createProductData.name || !createProductData.price || !createProductData.stock || !createProductData.categoryId || !createProductData.brandId) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('name', createProductData.name);
            formData.append('description', createProductData.description);
            formData.append('price', createProductData.price);
            formData.append('stock', createProductData.stock);
            formData.append('categoryId', createProductData.categoryId);
            formData.append('brandId', createProductData.brandId);
            formData.append('discount', createProductData.discount.toString());
            if (createProductData.discountPrice) {
                formData.append('discountPrice', createProductData.discountPrice);
            }
            formData.append('isNew', createProductData.isNew.toString());
            formData.append('isBestSeller', createProductData.isBestSeller.toString());
            formData.append('isTopRated', createProductData.isTopRated.toString());
            formData.append('isOnSale', createProductData.isOnSale.toString());
            formData.append('isTrending', createProductData.isTrending.toString());
            formData.append('isHot', createProductData.isHot.toString());
            formData.append('isFeatured', createProductData.isFeatured.toString());

            // Add thumbnail if selected
            if (createThumbnail) {
                formData.append('thumbnail', {
                    uri: createThumbnail,
                    type: 'image/jpeg',
                    name: 'thumbnail.jpg',
                } as any);
            }

            // Add images if selected
            createImages.forEach((imageUri, index) => {
                formData.append('images', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `image_${index}.jpg`,
                } as any);
            });

            await apiService.createProduct(formData);
            Alert.alert('Success', 'Product created successfully');
            setShowCreateModal(false);
            resetCreateForm();
            fetchProducts();
        } catch (error) {
            console.error('Error creating product:', error);
            Alert.alert('Error', 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProduct = async () => {
        if (!selectedProduct || !editProductData.name || !editProductData.price || !editProductData.stock || !editProductData.categoryId || !editProductData.brandId) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('name', editProductData.name);
            formData.append('description', editProductData.description);
            formData.append('price', editProductData.price);
            formData.append('stock', editProductData.stock);
            formData.append('categoryId', editProductData.categoryId);
            formData.append('brandId', editProductData.brandId);
            formData.append('discount', editProductData.discount.toString());
            if (editProductData.discountPrice) {
                formData.append('discountPrice', editProductData.discountPrice);
            }
            formData.append('isNew', editProductData.isNew.toString());
            formData.append('isBestSeller', editProductData.isBestSeller.toString());
            formData.append('isTopRated', editProductData.isTopRated.toString());
            formData.append('isOnSale', editProductData.isOnSale.toString());
            formData.append('isTrending', editProductData.isTrending.toString());
            formData.append('isHot', editProductData.isHot.toString());
            formData.append('isFeatured', editProductData.isFeatured.toString());

            // Add thumbnail if selected
            if (editThumbnail) {
                formData.append('thumbnail', {
                    uri: editThumbnail,
                    type: 'image/jpeg',
                    name: 'thumbnail.jpg',
                } as any);
            }

            // Add images if selected
            editImages.forEach((imageUri, index) => {
                formData.append('images', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `image_${index}.jpg`,
                } as any);
            });

            await apiService.updateProduct(selectedProduct.id, formData);
            Alert.alert('Success', 'Product updated successfully');
            setShowEditModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            Alert.alert('Error', 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddProduct = () => {
        resetCreateForm();
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

            {/* Create Product Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Product</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowCreateModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            {/* Basic Information */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Basic Information</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Product Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={createProductData.name}
                                        onChangeText={(text) => setCreateProductData({ ...createProductData, name: text })}
                                        placeholder="Enter product name"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Description</Text>
                                    <TextInput
                                        style={[ styles.input, styles.textArea ]}
                                        value={createProductData.description}
                                        onChangeText={(text) => setCreateProductData({ ...createProductData, description: text })}
                                        placeholder="Enter product description"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Price *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={createProductData.price}
                                            onChangeText={(text) => setCreateProductData({ ...createProductData, price: text })}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Stock *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={createProductData.stock}
                                            onChangeText={(text) => setCreateProductData({ ...createProductData, stock: text })}
                                            placeholder="0"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Category *</Text>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() => {
                                                // Show category picker
                                                Alert.alert(
                                                    'Select Category',
                                                    '',
                                                    categories.map(cat => ({
                                                        text: cat.name,
                                                        onPress: () => setCreateProductData({ ...createProductData, categoryId: cat.id })
                                                    }))
                                                );
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {createProductData.categoryId
                                                    ? categories.find(c => c.id === createProductData.categoryId)?.name || 'Select Category'
                                                    : 'Select Category'
                                                }
                                            </Text>
                                            <Text style={styles.dropdownArrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Brand *</Text>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() => {
                                                // Show brand picker
                                                Alert.alert(
                                                    'Select Brand',
                                                    '',
                                                    brands.map(brand => ({
                                                        text: brand.name,
                                                        onPress: () => setCreateProductData({ ...createProductData, brandId: brand.id })
                                                    }))
                                                );
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {createProductData.brandId
                                                    ? brands.find(b => b.id === createProductData.brandId)?.name || 'Select Brand'
                                                    : 'Select Brand'
                                                }
                                            </Text>
                                            <Text style={styles.dropdownArrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Discount Information */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Discount Information</Text>

                                <View style={styles.checkboxGroup}>
                                    <TouchableOpacity
                                        style={styles.checkboxRow}
                                        onPress={() => setCreateProductData({ ...createProductData, discount: !createProductData.discount })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.discount && styles.checkboxChecked ]}>
                                            {createProductData.discount && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.checkboxLabel}>Enable Discount</Text>
                                    </TouchableOpacity>
                                </View>

                                {createProductData.discount && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Discount Price</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={createProductData.discountPrice}
                                            onChangeText={(text) => setCreateProductData({ ...createProductData, discountPrice: text })}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                )}
                            </View>

                            {/* Image Selection */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Product Images</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Thumbnail Image</Text>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickThumbnail}>
                                        {createThumbnail ? (
                                            <Image source={{ uri: createThumbnail }} style={styles.selectedImage} />
                                        ) : (
                                            <View style={styles.imagePlaceholder}>
                                                <Text style={styles.imagePlaceholderText}>+ Add Thumbnail</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Product Images</Text>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
                                        <View style={styles.imagePlaceholder}>
                                            <Text style={styles.imagePlaceholderText}>+ Add Images</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {createImages.length > 0 && (
                                        <View style={styles.imageList}>
                                            {createImages.map((image, index) => (
                                                <View key={index} style={styles.imageItem}>
                                                    <Image source={{ uri: image }} style={styles.selectedImage} />
                                                    <TouchableOpacity
                                                        style={styles.removeImageButton}
                                                        onPress={() => removeImage(index)}
                                                    >
                                                        <Text style={styles.removeImageText}>×</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Product Flags */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Product Flags</Text>

                                <View style={styles.flagsGrid}>
                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isNew: !createProductData.isNew })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isNew && styles.checkboxChecked ]}>
                                            {createProductData.isNew && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>New</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isBestSeller: !createProductData.isBestSeller })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isBestSeller && styles.checkboxChecked ]}>
                                            {createProductData.isBestSeller && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Best Seller</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isTopRated: !createProductData.isTopRated })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isTopRated && styles.checkboxChecked ]}>
                                            {createProductData.isTopRated && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Top Rated</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isOnSale: !createProductData.isOnSale })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isOnSale && styles.checkboxChecked ]}>
                                            {createProductData.isOnSale && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>On Sale</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isTrending: !createProductData.isTrending })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isTrending && styles.checkboxChecked ]}>
                                            {createProductData.isTrending && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Trending</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isHot: !createProductData.isHot })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isHot && styles.checkboxChecked ]}>
                                            {createProductData.isHot && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Hot</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setCreateProductData({ ...createProductData, isFeatured: !createProductData.isFeatured })}
                                    >
                                        <View style={[ styles.checkbox, createProductData.isFeatured && styles.checkboxChecked ]}>
                                            {createProductData.isFeatured && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Featured</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={[ styles.button, styles.cancelButton ]}
                                    onPress={() => setShowCreateModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[ styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled ]}
                                    onPress={handleCreateProduct}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Create Product</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Product</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowEditModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            {/* Basic Information */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Basic Information</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Product Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editProductData.name}
                                        onChangeText={(text) => setEditProductData({ ...editProductData, name: text })}
                                        placeholder="Enter product name"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Description</Text>
                                    <TextInput
                                        style={[ styles.input, styles.textArea ]}
                                        value={editProductData.description}
                                        onChangeText={(text) => setEditProductData({ ...editProductData, description: text })}
                                        placeholder="Enter product description"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Price *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={editProductData.price}
                                            onChangeText={(text) => setEditProductData({ ...editProductData, price: text })}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Stock *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={editProductData.stock}
                                            onChangeText={(text) => setEditProductData({ ...editProductData, stock: text })}
                                            placeholder="0"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Category *</Text>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() => {
                                                // Show category picker
                                                Alert.alert(
                                                    'Select Category',
                                                    '',
                                                    categories.map(cat => ({
                                                        text: cat.name,
                                                        onPress: () => setEditProductData({ ...editProductData, categoryId: cat.id })
                                                    }))
                                                );
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {editProductData.categoryId
                                                    ? categories.find(c => c.id === editProductData.categoryId)?.name || 'Select Category'
                                                    : 'Select Category'
                                                }
                                            </Text>
                                            <Text style={styles.dropdownArrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[ styles.inputGroup, styles.halfWidth ]}>
                                        <Text style={styles.label}>Brand *</Text>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() => {
                                                // Show brand picker
                                                Alert.alert(
                                                    'Select Brand',
                                                    '',
                                                    brands.map(brand => ({
                                                        text: brand.name,
                                                        onPress: () => setEditProductData({ ...editProductData, brandId: brand.id })
                                                    }))
                                                );
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {editProductData.brandId
                                                    ? brands.find(b => b.id === editProductData.brandId)?.name || 'Select Brand'
                                                    : 'Select Brand'
                                                }
                                            </Text>
                                            <Text style={styles.dropdownArrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Discount Information */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Discount Information</Text>

                                <View style={styles.checkboxGroup}>
                                    <TouchableOpacity
                                        style={styles.checkboxRow}
                                        onPress={() => setEditProductData({ ...editProductData, discount: !editProductData.discount })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.discount && styles.checkboxChecked ]}>
                                            {editProductData.discount && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.checkboxLabel}>Enable Discount</Text>
                                    </TouchableOpacity>
                                </View>

                                {editProductData.discount && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Discount Price</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={editProductData.discountPrice}
                                            onChangeText={(text) => setEditProductData({ ...editProductData, discountPrice: text })}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                )}
                            </View>

                            {/* Image Selection */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Product Images</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Thumbnail Image</Text>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickEditThumbnail}>
                                        {editThumbnail ? (
                                            <Image source={{ uri: editThumbnail }} style={styles.selectedImage} />
                                        ) : (
                                            <View style={styles.imagePlaceholder}>
                                                <Text style={styles.imagePlaceholderText}>+ Add Thumbnail</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Product Images</Text>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickEditImages}>
                                        <View style={styles.imagePlaceholder}>
                                            <Text style={styles.imagePlaceholderText}>+ Add Images</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {editImages.length > 0 && (
                                        <View style={styles.imageList}>
                                            {editImages.map((image, index) => (
                                                <View key={index} style={styles.imageItem}>
                                                    <Image source={{ uri: image }} style={styles.selectedImage} />
                                                    <TouchableOpacity
                                                        style={styles.removeImageButton}
                                                        onPress={() => removeEditImage(index)}
                                                    >
                                                        <Text style={styles.removeImageText}>×</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Product Flags */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Product Flags</Text>

                                <View style={styles.flagsGrid}>
                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isNew: !editProductData.isNew })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isNew && styles.checkboxChecked ]}>
                                            {editProductData.isNew && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>New</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isBestSeller: !editProductData.isBestSeller })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isBestSeller && styles.checkboxChecked ]}>
                                            {editProductData.isBestSeller && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Best Seller</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isTopRated: !editProductData.isTopRated })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isTopRated && styles.checkboxChecked ]}>
                                            {editProductData.isTopRated && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Top Rated</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isOnSale: !editProductData.isOnSale })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isOnSale && styles.checkboxChecked ]}>
                                            {editProductData.isOnSale && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>On Sale</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isTrending: !editProductData.isTrending })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isTrending && styles.checkboxChecked ]}>
                                            {editProductData.isTrending && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Trending</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isHot: !editProductData.isHot })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isHot && styles.checkboxChecked ]}>
                                            {editProductData.isHot && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Hot</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.flagItem}
                                        onPress={() => setEditProductData({ ...editProductData, isFeatured: !editProductData.isFeatured })}
                                    >
                                        <View style={[ styles.checkbox, editProductData.isFeatured && styles.checkboxChecked ]}>
                                            {editProductData.isFeatured && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={styles.flagLabel}>Featured</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={[ styles.button, styles.cancelButton ]}
                                    onPress={() => setShowEditModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[ styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled ]}
                                    onPress={handleUpdateProduct}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Update Product</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
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
    // Form Styles
    formContainer: {
        flex: 1,
        padding: 16,
    },
    formSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    checkboxGroup: {
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    checkmark: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#374151',
    },
    flagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    flagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
    },
    flagLabel: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 8,
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        paddingBottom: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    // Dropdown Styles
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#6b7280',
    },
    // Image Picker Styles
    imagePicker: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholderText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    imageList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    imageItem: {
        position: 'relative',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ef4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeImageText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
