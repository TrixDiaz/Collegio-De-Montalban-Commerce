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
    Modal,
    SafeAreaView,
} from 'react-native';
import { apiService } from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    role?: string;
}

interface UsersResponse {
    users: User[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
}

export default function UsersScreen() {
    const [ users, setUsers ] = useState<User[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ refreshing, setRefreshing ] = useState(false);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ page, setPage ] = useState(1);
    const [ totalPages, setTotalPages ] = useState(1);
    const [ totalUsers, setTotalUsers ] = useState(0);
    const [ selectedUser, setSelectedUser ] = useState<User | null>(null);
    const [ showUserModal, setShowUserModal ] = useState(false);
    const [ showEditModal, setShowEditModal ] = useState(false);
    const [ showAddModal, setShowAddModal ] = useState(false);
    const [ editUserData, setEditUserData ] = useState({ name: '', email: '' });
    const [ addUserData, setAddUserData ] = useState({ name: '', email: '' });
    const [ isCreating, setIsCreating ] = useState(false);
    const [ isUpdating, setIsUpdating ] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await apiService.getUsers(page, 10, searchTerm);
            setUsers(response.users || []);
            setTotalPages(Math.ceil((response.total || 0) / 10));
            setTotalUsers(response.total || 0);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [ page, searchTerm ]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        setPage(1); // Reset to first page when searching
    };

    const handleUserPress = (user: User) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleDeleteUser = (user: User) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.deleteUser(user.id);
                            Alert.alert('Success', 'User deleted successfully');
                            fetchUsers();
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const handleEditUser = (user: User) => {
        setEditUserData({ name: user.name, email: user.email });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedUser || !editUserData.name.trim()) {
            Alert.alert('Error', 'Please enter a valid name');
            return;
        }

        setIsUpdating(true);
        try {
            await apiService.updateUser(selectedUser.id, { name: editUserData.name.trim() });
            Alert.alert('Success', 'User updated successfully!');
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Error', error.message || 'Failed to update user');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddUser = () => {
        setAddUserData({ name: '', email: '' });
        setShowAddModal(true);
    };

    const handleSaveAdd = async () => {
        console.log('handleSaveAdd called with data:', addUserData);

        if (!addUserData.name.trim() || !addUserData.email.trim()) {
            Alert.alert('Error', 'Please enter both name and email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(addUserData.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        console.log('Validation passed, creating user...');
        setIsCreating(true);
        try {
            const result = await apiService.createUser({
                name: addUserData.name.trim(),
                email: addUserData.email.trim().toLowerCase()
            });

            console.log('User creation result:', result);
            Alert.alert('Success', 'User created successfully!');
            setShowAddModal(false);
            setAddUserData({ name: '', email: '' });
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            Alert.alert('Error', error.message || 'Failed to add user');
        } finally {
            setIsCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderUserCard = (user: User) => (
        <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => handleUserPress(user)}
        >
            <View style={styles.userAvatar}>
                <Text style={styles.userInitials}>{getInitials(user.name)}</Text>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>

                <View style={styles.userMeta}>
                    <View style={styles.userStatus}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: user.isVerified ? '#10b981' : '#f59e0b' }
                        ]} />
                        <Text style={styles.statusText}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                        </Text>
                    </View>

                    {user.role && (
                        <Text style={styles.userRole}>{user.role}</Text>
                    )}
                </View>

                <Text style={styles.userDate}>
                    Joined {formatDate(user.createdAt)}
                </Text>
            </View>

            {/*  <View style={styles.userActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUserPress(user)}
                >
                    <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[ styles.actionButton, styles.deleteButton ]}
                    onPress={() => handleDeleteUser(user)}
                >
                    <Text style={[ styles.actionButtonText, styles.deleteButtonText ]}>Delete</Text>
                </TouchableOpacity>
            </View> */}
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
                    Page {page} of {totalPages} ({totalUsers} total users)
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
                <Text style={styles.loadingText}>Loading users...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.title}>Users</Text>
                        <Text style={styles.subtitle}>Manage user accounts</Text>
                    </View>
                    {/*  <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddUser}
                    >
                        <Text style={styles.addButtonText}>+ Add User</Text>
                    </TouchableOpacity>  */ }
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChangeText={handleSearch}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearSearchButton}
                            onPress={() => handleSearch('')}
                        >
                            <Text style={styles.clearSearchText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.usersContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {users.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No users found</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.usersList}>
                            {users.map(renderUserCard)}
                        </View>
                        {renderPagination()}
                    </>
                )}
            </ScrollView>

            {/* User Detail Modal */}
            <Modal
                visible={showUserModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>User Details</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowUserModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedUser && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.modalAvatar}>
                                <Text style={styles.modalInitials}>
                                    {getInitials(selectedUser.name)}
                                </Text>
                            </View>

                            <View style={styles.modalInfo}>
                                <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>

                                <View style={styles.modalDetails}>
                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>User ID:</Text>
                                        <Text style={styles.modalDetailValue}>{selectedUser.id}</Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Status:</Text>
                                        <View style={styles.modalStatusContainer}>
                                            <View style={[
                                                styles.modalStatusDot,
                                                { backgroundColor: selectedUser.isVerified ? '#10b981' : '#f59e0b' }
                                            ]} />
                                            <Text style={styles.modalDetailValue}>
                                                {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                                            </Text>
                                        </View>
                                    </View>

                                    {selectedUser.role && (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>Role:</Text>
                                            <Text style={styles.modalDetailValue}>{selectedUser.role}</Text>
                                        </View>
                                    )}

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Joined:</Text>
                                        <Text style={styles.modalDetailValue}>
                                            {formatDate(selectedUser.createdAt)}
                                        </Text>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Last Updated:</Text>
                                        <Text style={styles.modalDetailValue}>
                                            {formatDate(selectedUser.updatedAt)}
                                        </Text>
                                    </View>
                                </View>

                                {/*  <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalActionButton}
                                        onPress={() => {
                                            setShowUserModal(false);
                                            handleEditUser(selectedUser);
                                        }}
                                    >
                                        <Text style={styles.modalActionButtonText}>✏️ Edit User</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[ styles.modalActionButton, styles.modalDeleteButton ]}
                                        onPress={() => {
                                            setShowUserModal(false);
                                            handleDeleteUser(selectedUser);
                                        }}
                                    >
                                        <Text style={[ styles.modalActionButtonText, styles.modalDeleteButtonText ]}>
                                            🗑️ Delete User
                                        </Text>
                                    </TouchableOpacity>
                                </View>  */ }
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit User</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowEditModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Name</Text>
                            <TextInput
                                style={styles.formInput}
                                value={editUserData.name}
                                onChangeText={(text) => setEditUserData({ ...editUserData, name: text })}
                                placeholder="Enter user name"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Email</Text>
                            <TextInput
                                style={[ styles.formInput, styles.disabledInput ]}
                                value={editUserData.email}
                                editable={false}
                                placeholder="Email cannot be changed"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[ styles.modalActionButton, styles.cancelButton ]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[ styles.modalActionButton, styles.saveButton, isUpdating && styles.disabledButton ]}
                                onPress={handleSaveEdit}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add User Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New User</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowAddModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Name</Text>
                            <TextInput
                                style={styles.formInput}
                                value={addUserData.name}
                                onChangeText={(text) => setAddUserData({ ...addUserData, name: text })}
                                placeholder="Enter user name"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Email</Text>
                            <TextInput
                                style={styles.formInput}
                                value={addUserData.email}
                                onChangeText={(text) => setAddUserData({ ...addUserData, email: text })}
                                placeholder="Enter user email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/*  <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[ styles.modalActionButton, styles.cancelButton ]}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[ styles.modalActionButton, styles.saveButton, isCreating && styles.disabledButton ]}
                                onPress={handleSaveAdd}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Add User</Text>
                                )}
                            </TouchableOpacity>
                        </View>  */ }
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
        fontSize: 28,
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
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: 'white',
    },
    searchInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        paddingRight: 40,
    },
    clearSearchButton: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    clearSearchText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    usersContainer: {
        flex: 1,
        padding: 16,
    },
    usersList: {
        gap: 16,
    },
    userCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userInitials: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#6b7280',
    },
    userRole: {
        fontSize: 12,
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    userDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    userActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
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
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalInitials: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    modalInfo: {
        gap: 20,
    },
    modalUserName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
    },
    modalUserEmail: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    modalDetails: {
        gap: 16,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
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
    modalStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    modalActions: {
        gap: 12,
        marginTop: 20,
    },
    modalActionButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalActionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    modalDeleteButton: {
        backgroundColor: '#ef4444',
    },
    modalDeleteButtonText: {
        color: 'white',
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
    },
    cancelButton: {
        backgroundColor: '#6b7280',
    },
    cancelButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#10b981',
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
});
