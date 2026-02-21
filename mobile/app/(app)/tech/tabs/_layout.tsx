import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0f172a',
                    borderTopColor: '#1e293b',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#64748b',
                tabBarLabelStyle: { fontWeight: '600', fontSize: 10 }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialIcons name="dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders/index"
                options={{
                    title: 'O.S',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialIcons name="build-circle" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="customers/index"
                options={{
                    title: 'Clientes',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialIcons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="agenda/index"
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialIcons name="calendar-today" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
