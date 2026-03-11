import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GradesScreen from '../screens/GradesScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import EnrollmentScreen from '../screens/EnrollmentScreen';
import api from '../services/api';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_LABELS = { News: 'N', Enrollment: 'E', Grades: 'G', Schedule: 'S', Messages: 'M', Profile: 'P' };

function MessagesTabIcon({ focused, unreadCount }) {
  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: focused ? 'bold' : 'normal', color: focused ? COLORS.primary : COLORS.textLight }}>
        M
      </Text>
      {unreadCount > 0 && (
        <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: 'red', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 }}>
          <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );
}

function HomeTabs() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      api.get('/messages')
        .then(({ data }) => {
          const total = data.reduce((sum, c) => sum + (parseInt(c.unread_count) || 0), 0);
          setUnreadCount(total);
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 16, fontWeight: focused ? 'bold' : 'normal', color: focused ? COLORS.primary : COLORS.textLight }}>
            {TAB_LABELS[route.name] || '?'}
          </Text>
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: { fontSize: 10, marginBottom: 2 },
        tabBarStyle: { paddingTop: 4, height: 56 },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen name="News" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
      <Tab.Screen name="Enrollment" component={EnrollmentScreen} />
      <Tab.Screen name="Grades" component={GradesScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => <MessagesTabIcon focused={focused} unreadCount={unreadCount} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
