import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../ctx';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="tech" />
            <Stack.Screen name="client" />
        </Stack>
    );
}
