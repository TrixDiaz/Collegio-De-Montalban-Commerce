import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/services/api';

interface Sale {
    id: string;
    userId: string;
    orderNumber: string;
    items: any[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    shippingAddress?: any;
    notes?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface TodaySales {
    sales: any[];
    summary: {
        totalTransactions: number;
        totalSales: number;
        totalCash: number;
        totalGCash: number;
        totalMaya: number;
        totalCOD: number;
    };
    date: string;
}

export default function SalesScreen() {
    const { user } = useAuth();
    const [ sales, setSales ] = useState<Sale[]>([]);
    const [ todaySales, setTodaySales ] = useState<TodaySales | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ refreshing, setRefreshing ] = useState(false);
    const [ selectedSale, setSelectedSale ] = useState<Sale | null>(null);
    const [ showSaleModal, setShowSaleModal ] = useState(false);
    const [ activeTab, setActiveTab ] = useState<'today' | 'all'>('today');

    const fetchSalesData = async () => {
        try {
            const [ userSales, todayData ] = await Promise.all([
                apiService.getUserSales(1, 10),
                apiService.getTodaySales(),
            ]);

            setSales(Array.isArray(userSales.sales) ? userSales.sales : []);
            setTodaySales(todayData);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            Alert.alert('Error', 'Failed to load sales data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSalesData();
    };

    const handleSalePress = (sale: Sale) => {
        setSelectedSale(sale);
        setShowSaleModal(true);
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderTodaySummary = () => {
        if (!todaySales) return null;

        return (
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Today's Sales Summary</Text>
                <Text style={styles.summaryDate}>{formatDate(todaySales.date)}</Text>

                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Transactions</Text>
                        <Text style={styles.summaryValue}>{todaySales.summary.totalTransactions}</Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Sales</Text>
                        <Text style={[ styles.summaryValue, styles.summaryValuePrimary ]}>
                            {formatCurrency(todaySales.summary.totalSales)}
                        </Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Cash</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(todaySales.summary.totalCash)}
                        </Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>GCash</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(todaySales.summary.totalGCash)}
                        </Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Maya</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(todaySales.summary.totalMaya)}
                        </Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>COD</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(todaySales.summary.totalCOD)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderSalesList = () => {
        if (sales.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No sales data available</Text>
                </View>
            );
        }

        return (
            <View style={styles.salesList}>
                {sales.map((sale) => (
                    <TouchableOpacity
                        key={sale.id}
                        style={styles.saleCard}
                        onPress={() => handleSalePress(sale)}
                    >
                        <View style={styles.saleHeader}>
                            <View style={styles.saleUserInfo}>
                                <Text style={styles.saleUserName}>Order #{sale.orderNumber}</Text>
                                <Text style={styles.saleUserEmail}>
                                    {sale.paymentMethod.toUpperCase()} • {sale.status}
                                </Text>
                            </View>
                            <Text style={styles.saleTotal}>
                                {formatCurrency(sale.total)}
                            </Text>
                        </View>

                        <View style={styles.saleDetails}>
                            <View style={styles.saleDetailItem}>
                                <Text style={styles.saleDetailLabel}>Items</Text>
                                <Text style={styles.saleDetailValue}>{sale.items.length}</Text>
                            </View>

                            <View style={styles.saleDetailItem}>
                                <Text style={styles.saleDetailLabel}>Subtotal</Text>
                                <Text style={styles.saleDetailValue}>
                                    {formatCurrency(sale.subtotal)}
                                </Text>
                            </View>

                            <View style={styles.saleDetailItem}>
                                <Text style={styles.saleDetailLabel}>Tax</Text>
                                <Text style={styles.saleDetailValue}>
                                    {formatCurrency(sale.tax)}
                                </Text>
                            </View>

                            {sale.discount > 0 && (
                                <View style={styles.saleDetailItem}>
                                    <Text style={styles.saleDetailLabel}>Discount</Text>
                                    <Text style={styles.saleDetailValue}>
                                        -{formatCurrency(sale.discount)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.saleFooter}>
                            <Text style={styles.saleDate}>
                                {formatDate(sale.createdAt)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading sales data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sales</Text>
                <Text style={styles.subtitle}>Sales performance and analytics</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[ styles.tab, activeTab === 'today' && styles.activeTab ]}
                    onPress={() => setActiveTab('today')}
                >
                    <Text style={[ styles.tabText, activeTab === 'today' && styles.activeTabText ]}>
                        Today
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[ styles.tab, activeTab === 'all' && styles.activeTab ]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[ styles.tabText, activeTab === 'all' && styles.activeTabText ]}>
                        All Sales
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {activeTab === 'today' ? renderTodaySummary() : renderSalesList()}
            </ScrollView>

            {/* Sale Detail Modal */}
            <Modal
                visible={showSaleModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sales Details</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowSaleModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedSale && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalUserName}>{selectedSale.userName}</Text>
                                <Text style={styles.modalUserEmail}>{selectedSale.userEmail}</Text>

                                <View style={styles.modalSummary}>
                                    <View style={styles.modalSummaryItem}>
                                        <Text style={styles.modalSummaryLabel}>Total Sales</Text>
                                        <Text style={styles.modalSummaryValue}>
                                            {formatCurrency(selectedSale.totalSales)}
                                        </Text>
                                    </View>

                                    <View style={styles.modalSummaryItem}>
                                        <Text style={styles.modalSummaryLabel}>Transactions</Text>
                                        <Text style={styles.modalSummaryValue}>
                                            {selectedSale.totalTransactions}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalBreakdown}>
                                    <Text style={styles.modalBreakdownTitle}>Payment Breakdown</Text>

                                    <View style={styles.modalBreakdownItem}>
                                        <Text style={styles.modalBreakdownLabel}>Cash</Text>
                                        <Text style={styles.modalBreakdownValue}>
                                            {formatCurrency(selectedSale.totalCash)}
                                        </Text>
                                    </View>

                                    <View style={styles.modalBreakdownItem}>
                                        <Text style={styles.modalBreakdownLabel}>GCash</Text>
                                        <Text style={styles.modalBreakdownValue}>
                                            {formatCurrency(selectedSale.totalGCash)}
                                        </Text>
                                    </View>

                                    <View style={styles.modalBreakdownItem}>
                                        <Text style={styles.modalBreakdownLabel}>Maya</Text>
                                        <Text style={styles.modalBreakdownValue}>
                                            {formatCurrency(selectedSale.totalMaya)}
                                        </Text>
                                    </View>

                                    <View style={styles.modalBreakdownItem}>
                                        <Text style={styles.modalBreakdownLabel}>COD</Text>
                                        <Text style={styles.modalBreakdownValue}>
                                            {formatCurrency(selectedSale.totalCOD)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#3b82f6',
    },
    tabText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    summaryDate: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    summaryItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    summaryValuePrimary: {
        color: '#10b981',
        fontSize: 18,
    },
    salesList: {
        gap: 16,
    },
    saleCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    saleUserInfo: {
        flex: 1,
    },
    saleUserName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    saleUserEmail: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    saleTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    saleDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    saleDetailItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 6,
    },
    saleDetailLabel: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 2,
    },
    saleDetailValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1f2937',
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
    modalInfo: {
        gap: 20,
    },
    modalUserName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalUserEmail: {
        fontSize: 16,
        color: '#6b7280',
    },
    modalSummary: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 8,
        gap: 12,
    },
    modalSummaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalSummaryLabel: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    modalSummaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalBreakdown: {
        gap: 12,
    },
    modalBreakdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    modalBreakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalBreakdownLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    modalBreakdownValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
});
