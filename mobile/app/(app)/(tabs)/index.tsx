import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../ctx';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
    const { session, signOut } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTickets = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*, customers(name)')
                .eq('technician_id', session?.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Erro ao buscar OS:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (session) fetchTickets();
    }, [session]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTickets();
    }, []);

    return (
        <ScrollView
            className="flex-1 bg-darker"
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
            }
        >
            <View className="flex-row justify-between items-center mb-8">
                <View>
                    <Text className="text-gray-400 text-sm">Bem-vindo(a),</Text>
                    <Text className="text-white text-xl font-bold">{session?.user.email}</Text>
                </View>

                <TouchableOpacity onPress={signOut} className="bg-red-500/10 p-2 rounded-full">
                    <MaterialIcons name="logout" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <Text className="text-white text-lg font-bold mb-4">Minhas O.S de Hoje</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 20 }} />
            ) : tickets.length === 0 ? (
                <View className="bg-dark p-6 rounded-2xl border border-gray-800 items-center mt-4">
                    <MaterialIcons name="inbox" size={48} color="#64748b" />
                    <Text className="text-gray-400 mt-2 text-center">Nenhuma Ordem de Serviço atribuída a você no momento.</Text>
                </View>
            ) : (
                tickets.map((ticket) => (
                    <TouchableOpacity key={ticket.id} className="bg-dark p-4 rounded-2xl border border-gray-800 mb-4 flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{ticket.title}</Text>
                            <Text className="text-gray-400 text-sm" numberOfLines={1}>{ticket.customers?.name || 'Cliente Avulso'}</Text>
                        </View>
                        <View className="bg-primary-500/20 px-3 py-1 rounded-full">
                            <Text className="text-primary-500 font-semibold text-xs">{ticket.status === 'open' ? 'Aberta' : ticket.status === 'in_progress' ? 'Em Andamento' : 'Concluída'}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}
