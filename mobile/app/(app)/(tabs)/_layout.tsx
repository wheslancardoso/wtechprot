import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#0f172a', // dark
                },
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#0f172a',
                    borderTopColor: '#1e293b',
                },
                tabBarActiveTintColor: '#22c55e', // primary-500
                tabBarInactiveTintColor: '#64748b',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ordens de Serviço',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home-repair-service" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="customers"
                options={{
                    title: 'Clientes',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="people" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Meu Perfil',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="person" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
