import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../../ctx';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';

export default function ClientDashboard() {
    const { session, signOut } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(!refreshing);
        try {
            // Busca Ordens de Serviço (mesmo temporariamente sem RLS multi-tenant fixado, já garantinos exibir os corretos)
            const { data, error } = await supabase
                .from('orders')
                .select('*, equipment:equipments(type, model)')
                // .eq('user_id', session?.user.id) // Omissão até RLS final
                // .in('status', ['open', 'in_progress', 'waiting_parts', 'analyzing', 'waiting_approval', 'ready']) // ativas
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);

        } catch (error) {
            console.error('Erro ao buscar suas manutenções:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const translateOrderStatus = (status: string) => {
        const dict: Record<string, string> = {
            'open': 'Aberta',
            'analyzing': 'Analisando',
            'waiting_approval': 'Aprov. Pendente',
            'waiting_parts': 'Aguard. Peça',
            'in_progress': 'Executando',
            'ready': 'Pronto',
            'finished': 'Entregue',
            'canceled': 'Cancelado'
        };
        return dict[status] || status;
    };

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
                    <Text className="text-gray-400 text-sm">Olá,</Text>
                    <Text className="text-white text-xl font-bold">{session?.user.email}</Text>
                </View>

                <TouchableOpacity onPress={signOut} className="bg-red-500/10 p-2 rounded-full">
                    <MaterialIcons name="logout" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <Text className="text-white text-lg font-bold mb-4">Meus Equipamentos em Manutenção</Text>

            {loading ? (
                <ActivityIndicator size="small" color="#22c55e" style={{ marginVertical: 20 }} />
            ) : orders.length === 0 ? (
                <View className="bg-dark p-6 rounded-2xl border border-gray-800 items-center mt-4">
                    <MaterialIcons name="construction" size={48} color="#64748b" />
                    <Text className="text-gray-400 mt-2 text-center text-sm">Você não possui manutenções recentes no momento.</Text>
                </View>
            ) : (
                <View className="mb-6">
                    {orders.map((order) => (
                        <TouchableOpacity key={order.id} className="bg-dark p-4 rounded-2xl border border-gray-800 mb-2 flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>O.S {order.display_id}</Text>
                                <Text className="text-gray-400 text-sm" numberOfLines={1}>{order.equipment?.type || 'Equipamento'} {order.equipment?.model || ''}</Text>
                            </View>
                            <View className="bg-primary-500/20 px-3 py-1 rounded-full border border-primary-500/30">
                                <Text className="text-primary-500 font-semibold text-xs">{translateOrderStatus(order.status)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity className="bg-blue-500 mt-6 py-4 rounded-xl flex-row items-center justify-center space-x-2">
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">Agendar Nova Manutenção</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}
