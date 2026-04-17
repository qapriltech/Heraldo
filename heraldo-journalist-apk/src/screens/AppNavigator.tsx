import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../stores/auth';

import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import AgendaScreen from './AgendaScreen';
import CaptureScreen from './CaptureScreen';
import ForumScreen from './ForumScreen';
import ProfileScreen from './ProfileScreen';
import RevenuesScreen from './RevenuesScreen';
import ArchivesScreen from './ArchivesScreen';
import DirectoryScreen from './DirectoryScreen';
import NotificationsScreen from './NotificationsScreen';

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

const Tab = createBottomTabNavigator();

// -- Stack navigators per tab --
const DashboardStack = createNativeStackNavigator();
function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="Revenues" component={RevenuesScreen} />
      <DashboardStack.Screen name="Notifications" component={NotificationsScreen} />
    </DashboardStack.Navigator>
  );
}

const AgendaStack = createNativeStackNavigator();
function AgendaStackScreen() {
  return (
    <AgendaStack.Navigator screenOptions={{ headerShown: false }}>
      <AgendaStack.Screen name="AgendaHome" component={AgendaScreen} />
    </AgendaStack.Navigator>
  );
}

const CaptureStack = createNativeStackNavigator();
function CaptureStackScreen() {
  return (
    <CaptureStack.Navigator screenOptions={{ headerShown: false }}>
      <CaptureStack.Screen name="CaptureHome" component={CaptureScreen} />
    </CaptureStack.Navigator>
  );
}

const ForumStack = createNativeStackNavigator();
function ForumStackScreen() {
  return (
    <ForumStack.Navigator screenOptions={{ headerShown: false }}>
      <ForumStack.Screen name="ForumHome" component={ForumScreen} />
      <ForumStack.Screen name="Directory" component={DirectoryScreen} />
    </ForumStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Archives" component={ArchivesScreen} />
    </ProfileStack.Navigator>
  );
}

// -- Tab icon component --
function TabIcon({ label, focused, isCapture }: { label: string; focused: boolean; isCapture?: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '\u2302',
    Agenda: '\uD83D\uDCC5',
    Capture: '\uD83C\uDFA4',
    Forum: '\uD83D\uDCAC',
    Profil: '\uD83D\uDC64',
  };
  const icon = icons[label] || '\u2022';

  if (isCapture) {
    return (
      <View style={[styles.captureTab, focused && styles.captureTabFocused]}>
        <Text style={styles.captureIcon}>{icon}</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

// -- Main navigator --
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Agenda" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Capture"
        component={CaptureStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Capture" focused={focused} isCapture />,
        }}
      />
      <Tab.Screen
        name="Forum"
        component={ForumStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Forum" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// -- Auth wrapper --
export default function AppNavigator() {
  const { user, loading, loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>HERALDO</Text>
        <ActivityIndicator size="large" color={COLORS.orange} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 6,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    color: COLORS.warmGray,
  },
  tabIconFocused: {
    color: COLORS.orange,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.warmGray,
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelFocused: {
    color: COLORS.orange,
  },
  captureTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  captureTabFocused: {
    backgroundColor: COLORS.navy,
  },
  captureIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
