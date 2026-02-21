import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../../ctx';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { router, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function Dashboard() {
    const navigation = useNavigation();
    const { session, signOut } = useAuth();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(!refreshing);
        try {
            // Busca Agendamentos
            const { data: schedData, error: schedErr } = await supabase
                .from('schedules')
                .select('*')
                // .eq('technician_id', session?.user.id) // Omissão temporária até resolvermos as tenants/rls
                .order('created_at', { ascending: false });

            if (schedErr) throw schedErr;
            setSchedules(schedData || []);

            // Busca Ordens de Serviço Ativas
            const { data: ordData, error: ordErr } = await supabase
                .from('orders')
                .select('*, customer:customers(name)')
                .in('status', ['open', 'in_progress', 'waiting_parts', 'analyzing']) // apenas ativas
                // .eq('collected_by', session?.user.id) // Omissão temporária
                .order('created_at', { ascending: false });

            if (ordErr) throw ordErr;
            setOrders(ordData || []);

        } catch (error) {
            console.error('Erro ao buscar dados do Painel:', error);
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

    // Formata da Date (Simplório)
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Data não definida';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR');
    };

    const translateOrderStatus = (status: string) => {
        const dict: Record<string, string> = {
            'open': 'Aberta',
            'analyzing': 'Analisando',
            'waiting_approval': 'Aprov. Pendente',
            'waiting_parts': 'Aguard. Peça',
            'in_progress': 'Executando',
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
            {/* O cabeçalho global do Drawer agora renderiza esta área superior nativamente. */}
            <View className="mb-8">
                <Text className="text-white text-lg font-bold mb-4">Ações Rápidas</Text>
                <View className="flex-row justify-between flex-wrap">

                    <TouchableOpacity
                        className="w-[48%] bg-primary-500/10 p-4 rounded-2xl mb-4 border border-primary-500/20 items-center justify-center flex-col"
                        onPress={() => router.push('/(app)/tech/orders/new')}
                    >
                        <MaterialIcons name="add-circle-outline" size={32} color="#22c55e" />
                        <Text className="text-white font-bold mt-2">Nova O.S.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-dark p-4 rounded-2xl mb-4 border border-gray-800 items-center justify-center flex-col"
                        onPress={() => router.push('/(app)/tech/customers')}
                    >
                        <MaterialIcons name="people-outline" size={32} color="#3b82f6" />
                        <Text className="text-white font-bold mt-2">Clientes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-dark p-4 rounded-2xl mb-4 border border-gray-800 items-center justify-center flex-col"
                        onPress={() => router.push('/(app)/tech/agenda')}
                    >
                        <MaterialIcons name="calendar-today" size={32} color="#a855f7" />
                        <Text className="text-white font-bold mt-2">Agenda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-dark p-4 rounded-2xl mb-4 border border-gray-800 items-center justify-center flex-col"
                        onPress={() => router.push('/(app)/tech/metrics')}
                    >
                        <MaterialIcons name="bar-chart" size={32} color="#eab308" />
                        <Text className="text-white font-bold mt-2">Métricas</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ATIVIDADES EM ANDAMENTO (ORDENS DE SERVIÇO) */}
            <View className="flex-row justify-between items-end mb-4">
                <Text className="text-white text-lg font-bold">Em Aberto / Execução</Text>
                <TouchableOpacity onPress={() => console.log("Ver todas OS")}>
                    <Text className="text-primary-500 text-sm font-semibold">Ver todas</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="small" color="#22c55e" style={{ marginVertical: 20 }} />
            ) : orders.length === 0 ? (
                <View className="bg-dark p-6 rounded-2xl border border-gray-800 items-center mb-8">
                    <MaterialIcons name="inbox" size={32} color="#64748b" />
                    <Text className="text-gray-400 mt-2 text-center text-sm">Você não possui Ordens de Serviço em aberto.</Text>
                </View>
            ) : (
                <View className="mb-8">
                    {orders.slice(0, 3).map((order) => (
                        <TouchableOpacity key={order.id} className="bg-dark p-4 rounded-2xl border border-gray-800 mb-2 flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <View className="flex-row items-center space-x-2 mb-1">
                                    <Text className="text-white font-bold text-base">OS {order.display_id}</Text>
                                    <View className={`px-2 py-0.5 rounded-md ${order.status === 'open' ? 'bg-primary-500/20' : 'bg-blue-500/20'}`}>
                                        <Text className={`text-[10px] font-bold tracking-wider ${order.status === 'open' ? 'text-primary-500' : 'text-blue-400'}`}>
                                            {translateOrderStatus(order.status).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-gray-400 text-sm" numberOfLines={1}>
                                    <MaterialIcons name="person" size={14} color="#94a3b8" /> {order.customer?.name || 'Não identificado'}
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#475569" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* SEÇÃO AGENDAMENTOS MUDOU AQUI */}
            <View className="flex-row justify-between items-end mb-4 mt-2">
                <Text className="text-white text-lg font-bold">Meus Agendamentos</Text>
                <TouchableOpacity onPress={() => console.log("Ver agenda hoje")}>
                    <Text className="text-gray-400 text-sm font-semibold">Hoje</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="small" color="#22c55e" style={{ marginVertical: 20 }} />
            ) : schedules.length === 0 ? (
                <View className="bg-dark p-6 rounded-2xl border border-gray-800 items-center mb-8">
                    <MaterialIcons name="event-busy" size={32} color="#64748b" />
                    <Text className="text-gray-400 mt-2 text-center text-sm">Você tem folga. Sem visitas hoje.</Text>
                </View>
            ) : (
                <View className="mb-6">
                    {schedules.map((schedule) => (
                        <TouchableOpacity key={schedule.id} className="bg-dark p-4 rounded-2xl border border-gray-800 mb-2 flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{schedule.customer_name || 'Cliente Avulso'}</Text>
                                <View className="flex-row items-center gap-1">
                                    <MaterialIcons name="schedule" size={14} color="#94a3b8" />
                                    <Text className="text-gray-400 text-xs">
                                        {formatDate(schedule.scheduled_date)} às {schedule.scheduled_time?.slice(0, 5) || ''}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                <Text className="text-gray-300 font-semibold text-xs">{schedule.status === 'pending' ? 'Pendente' : schedule.status === 'confirmed' ? 'Confirmado' : 'Finalizado'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

        </ScrollView>
    );
}
