import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../ctx';

// Typings
export interface OrderWithCustomer {
    id: string;
    display_id: string;
    status: string;
    equipment: string;
    brand: string | null;
    model: string | null;
    created_at: string;
    labor_cost: number | null;
    parts_cost: number | null;
    customer: { name: string } | null;
}

export default function OrdersScreen() {
    const { session } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async (search?: string) => {
        setLoading(true);
        try {
            // Consulta base de OS com Join de Clientes
            let query = supabase
                .from('orders')
                .select('*, customer:customers(name)')
                .order('created_at', { ascending: false });

            if (search) {
                // Busca em id (número) ou equipamento
                const searchClean = search.replace(/\D/g, '');
                if (searchClean.length > 0) {
                    // Try to match display_id if it's numeric
                    query = query.ilike('display_id', `%${searchClean}%`);
                } else {
                    query = query.ilike('equipment', `%${search}%`);
                }
            }

            const { data: rawOrders, error } = await query;
            if (error) throw error;

            setOrders(rawOrders || []);

        } catch (error) {
            console.error('Erro ao buscar ordens:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle Submit do Search 
    const onSubmitSearch = () => {
        fetchOrders(searchQuery);
    };

    // Formatação
    function formatCurrency(value: number | null): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value || 0);
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR');
    };

    const translateOrderStatus = (status: string) => {
        const dict: Record<string, string> = {
            'open': 'Aberta',
            'analyzing': 'Analisando',
            'waiting_approval': 'Aprov. Pend',
            'waiting_parts': 'Aguard. Peça',
            'in_progress': 'Executando',
            'finished': 'Finalizada',
            'cancelled': 'Cancelada'
        };
        return dict[status] || status;
    };

    const getStatusColors = (status: string) => {
        const colors: Record<string, { bg: string, text: string }> = {
            'open': { bg: 'bg-primary-500/20', text: 'text-primary-500' },
            'analyzing': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
            'waiting_approval': { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
            'waiting_parts': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
            'in_progress': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
            'finished': { bg: 'bg-green-500/20', text: 'text-green-500' },
            'cancelled': { bg: 'bg-red-500/20', text: 'text-red-500' },
        };
        return colors[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
    };

    // Calculo Geral
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => ['open', 'in_progress', 'waiting_parts', 'analyzing', 'waiting_approval'].includes(o.status)).length;
    const totalRevenue = orders.reduce((acc, o) => {
        if (o.status === 'finished') {
            return acc + (Number(o.labor_cost) || 0) + (Number(o.parts_cost) || 0);
        }
        return acc;
    }, 0);

    const renderItem = ({ item }: { item: OrderWithCustomer }) => {
        const colors = getStatusColors(item.status);

        return (
            <TouchableOpacity
                className="bg-dark p-4 rounded-2xl border border-gray-800 mb-4 shadow-sm"
                onPress={() => console.log('Detalhes da OS', item.id)}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-white font-bold text-lg">OS {item.display_id}</Text>
                            <View className={`${colors.bg} px-2 py-0.5 rounded-md`}>
                                <Text className={`${colors.text} text-[10px] font-bold tracking-wider uppercase`}>{translateOrderStatus(item.status)}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-400 text-sm font-medium" numberOfLines={1}>{item.customer?.name || 'Cliente Avulso'}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center bg-darker p-3 rounded-xl border border-gray-800/60 mt-2">
                    <View className="flex-1">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Equipamento</Text>
                        <Text className="text-gray-300 text-sm font-medium" numberOfLines={1}>
                            {item.equipment} {item.brand ? `(${item.brand})` : ''}
                        </Text>
                    </View>
                    <View className="items-end ml-4">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Data</Text>
                        <Text className="text-gray-400 text-sm font-bold tracking-tight">{formatDate(item.created_at)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-darker">
            {/* Header / Nav */}
            <View className="px-5 pt-6 pb-4 bg-dark border-b border-gray-800 flex-row items-center justify-between">
                <View>
                    <Text className="text-white text-xl font-bold tracking-tight">Ordens de Serviço</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">Gerenciamento completo</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(app)/tech/orders/new')}
                    className="bg-primary-500 w-10 h-10 rounded-full items-center justify-center flex-row shadow-sm shadow-primary-500/30"
                >
                    <MaterialIcons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Metrics Header */}
            <View className="px-5 py-5 flex-row justify-between">
                <View className="items-center bg-dark px-4 py-3 rounded-2xl border border-gray-800 w-[30%]">
                    <MaterialIcons name="fact-check" size={22} color="#3b82f6" className="mb-1" />
                    <Text className="text-white font-bold text-lg">{totalOrders}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold mt-1">TOTAL OS</Text>
                </View>
                <View className="items-center bg-dark px-4 py-3 rounded-2xl border border-gray-800 w-[30%]">
                    <MaterialIcons name="build-circle" size={22} color="#f59e0b" className="mb-1" />
                    <Text className="text-white font-bold text-lg">{activeOrders}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold mt-1">ATIVAS</Text>
                </View>
                <View className="items-center bg-dark px-4 py-3 rounded-2xl border border-gray-800 w-[36%]">
                    <MaterialIcons name="monetization-on" size={22} color="#22c55e" className="mb-1" />
                    <Text className="text-white font-bold text-lg" numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalRevenue)}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold mt-1">FATURAMENTO</Text>
                </View>
            </View>

            {/* Content Body */}
            <View className="flex-1 px-5">
                {/* Search Bar */}
                <View className="bg-dark flex-row items-center px-4 py-3 rounded-2xl border border-gray-800 mb-6 shadow-sm">
                    <MaterialIcons name="search" size={22} color="#64748b" />
                    <TextInput
                        className="flex-1 ml-3 text-white text-base font-medium"
                        placeholder="Buscar O.S. (Número ou Aparelho)"
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={onSubmitSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); fetchOrders(); }}>
                            <MaterialIcons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* List */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className="text-gray-400 mt-4 text-sm font-medium tracking-wide">Buscando inteligência...</Text>
                    </View>
                ) : orders.length === 0 ? (
                    <View className="flex-1 justify-center items-center pb-20">
                        <MaterialIcons name="search-off" size={64} color="#334155" />
                        <Text className="text-white font-bold mt-6 text-lg">Nenhuma O.S encontrada.</Text>
                        <Text className="text-gray-500 mt-2 text-center text-sm tracking-wide max-w-[250]">
                            Nenhum resultado pra sua busca ou não há ordens abertas.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                )}
            </View>
        </View>
    );
}
