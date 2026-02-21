import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

type AuthRole = 'TECH' | 'CLIENT' | null;

type AuthContextType = {
    session: Session | null;
    role: AuthRole;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<any>;
    signInWithOtp: (email: string) => Promise<any>;
    verifyOtp: (email: string, token: string) => Promise<any>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    role: null,
    isLoading: true,
    signIn: async () => { },
    signInWithOtp: async () => { },
    verifyOtp: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useAuth must be wrapped in a <AuthProvider />');
        }
    }
    return value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<AuthRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper para simular a descoberta de perfil baseada no banco real
    // Na Opção A real do app, se criarmos clientes com credencial de Auth, 
    // haverá uma tabela 'profiles' ou metadado no JWT indicando a role.
    const determineRole = (session: Session | null): AuthRole => {
        if (!session?.user) return null;
        return session.user.email?.toLowerCase().includes('cliente') ? 'CLIENT' : 'TECH';
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setRole(determineRole(session));
            setIsLoading(false);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setRole(determineRole(session));
        });
    }, []);

    const signIn = async (email: string, pass: string) => {
        return await supabase.auth.signInWithPassword({
            email,
            password: pass
        });
    };

    const signInWithOtp = async (email: string) => {
        return await supabase.auth.signInWithOtp({
            email,
        });
    };

    const verifyOtp = async (email: string, token: string) => {
        return await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                role,
                isLoading,
                signIn,
                signInWithOtp,
                verifyOtp,
                signOut,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
