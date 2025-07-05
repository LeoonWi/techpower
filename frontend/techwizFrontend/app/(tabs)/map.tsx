import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MapPin, Navigation, Filter } from 'lucide-react-native';

// Conditionally import MapView only for native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default;
    Marker = MapModule.Marker;
    PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('react-native-maps not available');
  }
}

// Location import with platform check
let Location: any = null;
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch (error) {
    console.warn('expo-location not available');
  }
}

export default function MapScreen() {
  const { user } = useAuth();
  const { orders } = useData();
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // For web, use a default location (Moscow)
        setLocation({
          coords: {
            latitude: 55.7558,
            longitude: 37.6176,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        return;
      }

      if (!Location) {
        setErrorMsg('Location services not available');
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (showOnlyAssigned && user?.role !== 'admin') {
      return order.assignedMasterId === user?.id;
    }
    return true;
  });

  const getMarkerColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      assigned: '#2563EB',
      in_progress: '#059669',
      completed: '#10B981',
      cancelled: '#EF4444',
      rejected: '#DC2626',
      modernization: '#7C3AED',
    };
    return colors[status as keyof typeof colors] || '#64748B';
  };

  const handleMarkerPress = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const selectedOrderData = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;

  // Web fallback component with ScrollView
  const WebMapFallback = () => (
    <ScrollView
      style={styles.webMapPlaceholder}
      contentContainerStyle={styles.webMapContentContainer}
      showsVerticalScrollIndicator={true}
    >
      <MapPin size={48} color="#64748B" />
      <Text style={styles.webMapText}>Карта заказов</Text>
      <Text style={styles.webMapSubtext}>
        Интерактивная карта доступна в мобильном приложении
      </Text>
      <View style={styles.ordersList}>
        {filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>{order.title}</Text>
            </View>
            <Text style={styles.orderAddress}>{order.address}, {order.city}</Text>
            <Text style={styles.orderPrice}>{order.price.toLocaleString('ru-RU')} ₽</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // Native map component with scrollable order details
  const NativeMap = () => {
    if (!MapView || !Marker) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Map component not available</Text>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.coords.latitude || 55.7558,
            longitude: location?.coords.longitude || 37.6176,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {filteredOrders.map((order) => (
            <Marker
              key={order.id}
              coordinate={{
                latitude: order.coordinates.latitude,
                longitude: order.coordinates.longitude,
              }}
              onPress={() => handleMarkerPress(order.id)}
              pinColor={getMarkerColor(order.status)}
            />
          ))}
        </MapView>

        {selectedOrderData && (
          <View style={styles.orderDetails}>
            <ScrollView
              contentContainerStyle={styles.orderDetailsContentContainer}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.orderDetailsHeader}>
                <View style={styles.orderTitleRow}>
                  <Text style={styles.orderDetailsTitle}>{selectedOrderData.title}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.orderDetailsDescription}>
                {selectedOrderData.description}
              </Text>
              <View style={styles.orderDetailsInfo}>
                <Text style={styles.orderDetailsAddress}>
                  {selectedOrderData.address}, {selectedOrderData.city}
                </Text>
                <Text style={styles.orderDetailsPrice}>
                  {selectedOrderData.price.toLocaleString('ru-RU')} ₽
                </Text>
              </View>
              <View style={styles.orderDetailsFooter}>
                <Text style={styles.orderDetailsClient}>
                  {selectedOrderData.clientName} • {selectedOrderData.clientPhone}
                </Text>
                <View
                  style={[
                    styles.orderDetailsStatus,
                    { backgroundColor: `${getMarkerColor(selectedOrderData.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.orderDetailsStatusText,
                      { color: getMarkerColor(selectedOrderData.status) },
                    ]}
                  >
                    {selectedOrderData.status}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Карта заказов</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.filterButton, showOnlyAssigned && styles.filterButtonActive]}
            onPress={() => setShowOnlyAssigned(!showOnlyAssigned)}
          >
            <Filter size={16} color={showOnlyAssigned ? 'white' : '#2563EB'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton}>
            <Navigation size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <WebMapFallback />
      ) : (
        <NativeMap />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  locationButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    zIndex: 0,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    textAlign: 'center',
  },
  orderDetails: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 5,
    maxHeight: 300, // Limit height to ensure scrolling
  },
  orderDetailsContentContainer: {
    paddingBottom: 100, // Ensure enough space to scroll to the bottom
    flexGrow: 1,
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderDetailsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginRight: 8,
  },
  closeButton: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  orderDetailsDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  orderDetailsInfo: {
    marginBottom: 12,
  },
  orderDetailsAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 4,
  },
  orderDetailsPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
  orderDetailsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetailsClient: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  orderDetailsStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderDetailsStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  webMapPlaceholder: {
    flex: 1,
    paddingHorizontal: 20,
  },
  webMapContentContainer: {
    paddingTop: 20,
    paddingBottom: 100, // Ensure enough space to scroll to the bottom
    alignItems: 'center',
    flexGrow: 1,
  },
  webMapText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  ordersList: {
    width: '100%',
    maxWidth: 600,
  },
  orderItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  orderAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
});