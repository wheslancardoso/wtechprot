import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../ctx';

export default function AppIndex() {
    const { role } = useAuth();

    if (role === 'TECH') {
        return <Redirect href="/tech/tabs" />;
    } else {
        // Para 'CLIENT' ou null fallback
        return <Redirect href="/client/tabs" />;
    }
}
