import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

interface Tab {
  name: string;
  title: string;
  icon: any;
}

interface CustomTabSliderProps {
  tabs: Tab[];
}

export default function CustomTabSlider({ tabs }: CustomTabSliderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  
  const getActiveTab = () => {
    const currentPath = pathname.split('/').pop() || 'index';
    return currentPath === '' ? 'index' : currentPath;
  };

  const activeTab = getActiveTab();

  const handleTabPress = (tabName: string) => {
    if (tabName === 'index') {
      router.push('/');
    } else {
      router.push(`/${tabName}` as any);
    }
  };

  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.name;
    const IconComponent = tab.icon;

    return (
      <TouchableOpacity
        key={tab.name}
        style={[styles.tabItem, isActive && styles.activeTab]}
        onPress={() => handleTabPress(tab.name)}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <IconComponent
            size={isActive ? 23 : 20}
            color={isActive ? '#2563EB' : '#64748B'}
            strokeWidth={isActive ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              isActive && styles.activeTabLabel,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {tab.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        decelerationRate="fast"
      >
        {tabs.map(renderTab)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: 0,
    alignItems: 'center',
    minWidth: width,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    //borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
  },
}); 