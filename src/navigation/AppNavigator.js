import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { BuildingsProvider } from '../context/BuildingsContext';
import { StaffProvider } from '../context/StaffContext';
import { NotificationsProvider } from '../context/NotificationsContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

import LoginScreen from '../screens/LoginScreen';

// Admin screens
import DashboardScreen from '../screens/DashboardScreen';
import RoomsScreen from '../screens/RoomsScreen';
import CustomersScreen from '../screens/CustomersScreen';
import StaffScreen from '../screens/StaffScreen';
import LandlordScreen from '../screens/LandlordScreen';

// Staff screens
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffRoomsScreen from '../screens/staff/StaffRoomsScreen';
import StaffCustomersScreen from '../screens/staff/StaffCustomersScreen';

// Tenant screens
import TenantHomeScreen from '../screens/tenant/TenantHomeScreen';
import TenantPaymentScreen from '../screens/tenant/TenantPaymentScreen';
import TenantReportScreen from '../screens/tenant/TenantReportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabBarStyle = {
  backgroundColor: '#1a1a2e',
  borderTopColor: 'rgba(255,255,255,0.08)',
  borderTopWidth: 1,
  paddingBottom: 4,
  paddingTop: 4,
  height: 66,
};

const tabItemStyle = {
  borderRadius: 20,
  marginHorizontal: 4,
  marginVertical: 4,
  overflow: 'hidden',
};

// ─── Admin Tabs ───────────────────────────────────────────
function AdminTabs() {
  const { t } = useLanguage();
  const color = '#e94560';
  return (
    <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: color,
          tabBarInactiveTintColor: '#8892b0',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 1 },
          tabBarActiveBackgroundColor: 'rgba(233,69,96,0.16)',
          tabBarItemStyle: tabItemStyle,
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen}
          options={{ tabBarLabel: t('nav.overview'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>📊</Text> }} />
        <Tab.Screen name="Rooms" component={RoomsScreen}
          options={{ tabBarLabel: t('nav.rooms'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>🏠</Text> }} />
        <Tab.Screen name="Customers" component={CustomersScreen}
          options={{ tabBarLabel: t('nav.customers'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>👥</Text> }} />
        <Tab.Screen name="Staff" component={StaffScreen}
          options={{ tabBarLabel: t('nav.staff'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>👨‍💼</Text> }} />
        <Tab.Screen name="Landlord" component={LandlordScreen}
          options={{ tabBarLabel: 'Chủ nhà', tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>🏡</Text> }} />
      </Tab.Navigator>
  );
}

// ─── Staff Tabs ───────────────────────────────────────────
function StaffTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#4facfe',
        tabBarInactiveTintColor: '#8892b0',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 1 },
        tabBarActiveBackgroundColor: 'rgba(79,172,254,0.16)',
        tabBarItemStyle: tabItemStyle,
      }}
    >
      <Tab.Screen name="StaffRooms" component={StaffRoomsScreen}
        options={{ tabBarLabel: t('nav.roomsOverview'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>🏠</Text> }} />
      <Tab.Screen name="StaffCustomers" component={StaffCustomersScreen}
        options={{ tabBarLabel: t('nav.customers'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>👥</Text> }} />
    </Tab.Navigator>
  );
}

// ─── Tenant Tabs ──────────────────────────────────────────
function TenantTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#43e97b',
        tabBarInactiveTintColor: '#8892b0',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 1 },
        tabBarActiveBackgroundColor: 'rgba(67,233,123,0.16)',
        tabBarItemStyle: tabItemStyle,
      }}
    >
      <Tab.Screen name="TenantHome" component={TenantHomeScreen}
        options={{ tabBarLabel: t('nav.home'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>🏠</Text> }} />
      <Tab.Screen name="TenantPayment" component={TenantPaymentScreen}
        options={{ tabBarLabel: t('nav.payment'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>💳</Text> }} />
      <Tab.Screen name="TenantReport" component={TenantReportScreen}
        options={{ tabBarLabel: t('nav.report'), tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 19 }}>🔧</Text> }} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────
export default function AppNavigator() {
  return (
    <LanguageProvider>
      <BuildingsProvider>
        <StaffProvider>
          <NotificationsProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="AdminMain" component={AdminTabs} />
                <Stack.Screen name="StaffMain" component={StaffTabs} />
                <Stack.Screen name="TenantMain" component={TenantTabs} />
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationsProvider>
        </StaffProvider>
      </BuildingsProvider>
    </LanguageProvider>
  );
}
