import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../ctx';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}
