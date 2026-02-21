import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ClientTabLayout() {
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
                tabBarActiveTintColor: '#3b82f6', // blue-500
                tabBarInactiveTintColor: '#64748b',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Meus Equipamentos',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="devices" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="approvals"
                options={{
                    title: 'Aprovações',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="verified" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
