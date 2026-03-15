import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
const TAB_HORIZONTAL_PADDING = 12;
const TAB_BAR_OUTER_MARGIN = 12;

const TAB_TITLES = {
  News: 'News',
  Enrollment: 'Enroll',
  Grades: 'Grades',
  Schedule: 'Class',
  Messages: 'Inbox',
  Profile: 'Profile',
};

function BubbleTabBar({ state, descriptors, navigation }) {
  const activeIndex = state.index;
  const activeAnim = React.useRef(new Animated.Value(activeIndex)).current;
  const tabBarWidth = Dimensions.get('window').width - TAB_BAR_OUTER_MARGIN * 2 - TAB_HORIZONTAL_PADDING * 2;
  const tabWidth = tabBarWidth / state.routes.length;
  const bubbleWidth = Math.max(62, tabWidth - 8);
  const bubbleOffset = (tabWidth - bubbleWidth) / 2;

  useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: activeIndex,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [activeAnim, activeIndex]);

  const bubbleTranslateX = activeAnim.interpolate({
    inputRange: state.routes.map((_, idx) => idx),
    outputRange: state.routes.map((_, idx) => idx * tabWidth + bubbleOffset),
  });

  return (
    <View style={styles.tabBarShell}>
      <View style={styles.tabBarTrack}>
        <Animated.View style={[styles.tabBubble, { width: bubbleWidth, transform: [{ translateX: bubbleTranslateX }] }]} />
        {state.routes.map((route, idx) => {
          const isFocused = activeIndex === idx;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable key={route.key} onPress={onPress} onLongPress={onLongPress} style={styles.tabItem}>
              <View style={styles.tabTextWrap}>
                <Text numberOfLines={1} style={[styles.tabTitle, isFocused && styles.tabTitleFocused]}>
                  {TAB_TITLES[route.name] || route.name}
                </Text>
                {route.name === 'Messages' && options.tabBarBadge !== undefined && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {Number(options.tabBarBadge) > 99 ? '99+' : options.tabBarBadge}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
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
      tabBar={(props) => <BubbleTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#153557' },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', letterSpacing: 0.3 },
        headerShadowVisible: false,
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
          tabBarBadge: unreadCount,
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

const styles = StyleSheet.create({
  tabBarShell: {
    backgroundColor: 'transparent',
    paddingHorizontal: TAB_BAR_OUTER_MARGIN,
    paddingBottom: 12,
    paddingTop: 4,
  },
  tabBarTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF2F8',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D3DFEC',
    paddingHorizontal: TAB_HORIZONTAL_PADDING,
    paddingVertical: 9,
    shadowColor: '#0A2237',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tabBubble: {
    position: 'absolute',
    top: 7,
    bottom: 7,
    left: TAB_HORIZONTAL_PADDING,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C5D4E4',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    zIndex: 2,
  },
  tabTextWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabTitle: {
    fontSize: 11,
    color: '#6B7D91',
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
    maxWidth: '90%',
  },
  tabTitleFocused: {
    color: '#153557',
    fontWeight: '800',
  },
  unreadBadge: {
    position: 'absolute',
    top: -10,
    right: 1,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#C73232',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});
