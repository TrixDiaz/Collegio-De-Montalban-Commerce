import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';

interface PickerItem {
  id: string;
  name: string;
}

interface ScrollablePickerProps {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedItem: PickerItem | null;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
}

export function ScrollablePicker({
  visible,
  title,
  items,
  selectedItem,
  onSelect,
  onClose,
}: ScrollablePickerProps) {
  const renderItem = ({ item }: { item: PickerItem }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedItem?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Text
        style={[
          styles.itemText,
          selectedItem?.id === item.id && styles.selectedItemText,
        ]}
      >
        {item.name}
      </Text>
      {selectedItem?.id === item.id && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          showsVerticalScrollIndicator={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
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
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  selectedItem: {
    backgroundColor: '#dbeafe',
  },
  itemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedItemText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 16,
  },
});
