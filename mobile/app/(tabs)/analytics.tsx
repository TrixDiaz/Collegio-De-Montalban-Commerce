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
    SafeAreaView,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { apiService, AnalyticsData } from '@/services/api';

export default function AnalyticsScreen() {
    const { user } = useAuth();
    const [ analytics, setAnalytics ] = useState<AnalyticsData | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ refreshing, setRefreshing ] = useState(false);
    const [ period, setPeriod ] = useState('30d');

    const fetchAnalytics = async () => {
        try {
            const [ statsData, salesData, productsData, categoryData, activityData ] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getSalesAnalytics(period),
                apiService.getProductAnalytics(),
                apiService.getCategoryDistribution(period),
                apiService.getRecentActivity(10),
            ]);

            setAnalytics({
                totalRevenue: statsData?.totalRevenue || 0,
                totalOrders: statsData?.totalOrders || 0,
                totalUsers: statsData?.totalUsers || 0,
                totalProducts: statsData?.totalProducts || 0,
                revenueGrowth: statsData?.revenueGrowth || 0,
                ordersGrowth: statsData?.ordersGrowth || 0,
                usersGrowth: statsData?.usersGrowth || 0,
                salesData: Array.isArray(salesData) ? salesData : [],
                topProducts: Array.isArray(productsData) ? productsData : [],
                categoryDistribution: Array.isArray(categoryData) ? categoryData : [],
                recentActivity: Array.isArray(activityData) ? activityData : [],
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            Alert.alert('Error', 'Failed to load analytics data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Only fetch data if user is authenticated
        if (user) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }
    }, [ user, period ]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const periodOptions = [
        { label: '7 Days', value: '7d' },
        { label: '30 Days', value: '30d' },
        { label: '90 Days', value: '90d' },
        { label: '1 Year', value: '1y' },
    ];

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₱${(analytics?.totalRevenue || 0).toLocaleString()}`,
            icon: '💰',
            color: '#3b82f6',
            change: analytics?.revenueGrowth || 0,
        },
        {
            title: 'Total Orders',
            value: analytics?.totalOrders || 0,
            icon: '🛒',
            color: '#10b981',
            change: analytics?.ordersGrowth || 0,
        },
        {
            title: 'Total Users',
            value: analytics?.totalUsers || 0,
            icon: '👥',
            color: '#f59e0b',
            change: analytics?.usersGrowth || 0,
        },
        {
            title: 'Total Products',
            value: analytics?.totalProducts || 0,
            icon: '📦',
            color: '#8b5cf6',
            change: 0,
        },
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
            <View style={styles.header}>
                <Text style={styles.title}>Analytics</Text>
                <Text style={styles.subtitle}>Business performance insights</Text>
            </View>

            {/* Period Selector */}
            <View style={styles.periodSelector}>
                <Text style={styles.periodLabel}>Time Period:</Text>
                <View style={styles.periodButtons}>
                    {periodOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.periodButton,
                                period === option.value && styles.periodButtonActive,
                            ]}
                            onPress={() => setPeriod(option.value)}
                        >
                            <Text
                                style={[
                                    styles.periodButtonText,
                                    period === option.value && styles.periodButtonTextActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <View key={index} style={[ styles.statCard, { borderLeftColor: card.color } ]}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statIcon}>{card.icon}</Text>
                            <Text style={styles.statTitle}>{card.title}</Text>
                        </View>
                        <Text style={styles.statValue}>{card.value}</Text>
                        {card.change !== 0 && (
                            <View style={styles.statChange}>
                                <Text style={[
                                    styles.statChangeText,
                                    { color: card.change > 0 ? '#10b981' : '#ef4444' }
                                ]}>
                                    {card.change > 0 ? '↗' : '↘'} {Math.abs(card.change)}%
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Top Products */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Products</Text>
                <View style={styles.productsList}>
                    {(analytics?.topProducts || []).slice(0, 5).map((product, index) => (
                        <View key={index} style={styles.productItem}>
                            <View style={styles.productRank}>
                                <Text style={styles.productRankText}>{index + 1}</Text>
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name || 'Unknown Product'}</Text>
                                <Text style={styles.productSales}>{product.sales || 0} sales</Text>
                            </View>
                            <Text style={styles.productRevenue}>
                                ₱{(product.revenue || 0).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                    {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No product data available</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Category Distribution */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sales by Category</Text>
                <View style={styles.categoriesList}>
                    {(analytics?.categoryDistribution || []).map((category, index) => (
                        <View key={index} style={styles.categoryItem}>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryValue}>
                                    ₱{category.value.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.categoryBar}>
                                <View
                                    style={[
                                        styles.categoryBarFill,
                                        {
                                            width: `${(category.value / Math.max(...(analytics?.categoryDistribution || []).map(c => c.value))) * 100}%`,
                                            backgroundColor: [ '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444' ][ index % 5 ],
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                    {(!analytics?.categoryDistribution || analytics.categoryDistribution.length === 0) && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No category data available</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityList}>
                    {(analytics?.recentActivity || []).map((activity, index) => (
                        <View key={index} style={styles.activityItem}>
                            <View style={[
                                styles.activityDot,
                                {
                                    backgroundColor: activity.type === 'order' ? '#10b981' :
                                        activity.type === 'user' ? '#3b82f6' :
                                            activity.type === 'product' ? '#f59e0b' : '#8b5cf6'
                                }
                            ]} />
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activityDescription}>{activity.description}</Text>
                                <Text style={styles.activityTime}>
                                    {new Date(activity.timestamp).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No recent activity</Text>
                        </View>
                    )}
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
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
    periodSelector: {
        padding: 16,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    periodLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    periodButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    periodButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    periodButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    periodButtonText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    periodButtonTextActive: {
        color: 'white',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    statTitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statChange: {
        marginTop: 4,
    },
    statChangeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    productsList: {
        gap: 12,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    productRank: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productRankText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    productSales: {
        fontSize: 12,
        color: '#6b7280',
    },
    productRevenue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    categoriesList: {
        gap: 12,
    },
    categoryItem: {
        gap: 8,
    },
    categoryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    categoryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    categoryBar: {
        height: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    categoryBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    activityList: {
        gap: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    activityDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    activityTime: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});
