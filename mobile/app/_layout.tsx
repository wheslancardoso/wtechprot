import { Slot } from 'expo-router';
import { AuthProvider } from '../ctx';
import "../global.css";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}
