import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

// Typings
export interface CustomerWithStats {
    id: string;
    name: string;
    document_id: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    created_at: string;
    orders_count: number;
    total_ltv: number;
    last_order_date: string | null;
}

export default function CustomersScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = useCallback(async (search?: string) => {
        setLoading(true);
        try {
            // Consulta base de Clientes
            let query = supabase
                .from('customers')
                .select('*')
                .order('name', { ascending: true });

            if (search) {
                const searchClean = search.replace(/\D/g, '');
                if (searchClean.length >= 3) {
                    query = query.ilike('document_id', `%${searchClean}%`);
                } else {
                    query = query.ilike('name', `%${search}%`);
                }
            }

            const { data: rawCustomers, error } = await query;
            if (error) throw error;

            // Busca as ordens (OS) em lote para não sobrecarregar com um map de consultas 1 por 1
            const customerIds = rawCustomers?.map((c: any) => c.id) || [];

            let ordersMap: Record<string, { count: number; ltv: number; last_date: string | null }> = {};

            if (customerIds.length > 0) {
                const { data: allOrders, error: ordErr } = await supabase
                    .from('orders')
                    .select('customer_id, labor_cost, created_at, status')
                    .in('customer_id', customerIds)
                    .order('created_at', { ascending: false });

                if (!ordErr && allOrders) {
                    allOrders.forEach((order: any) => {
                        if (!ordersMap[order.customer_id]) {
                            ordersMap[order.customer_id] = { count: 0, ltv: 0, last_date: order.created_at };
                        }
                        // Conta apenas as finalizadas pro LTV e count (regra web mantida)
                        if (order.status === 'finished') {
                            ordersMap[order.customer_id].count += 1;
                            ordersMap[order.customer_id].ltv += Number(order.labor_cost) || 0;
                        }
                    });
                }
            }

            // Agrega os resultados
            const customersWithStats: CustomerWithStats[] = (rawCustomers || []).map((cust: any) => {
                const stats = ordersMap[cust.id] || { count: 0, ltv: 0, last_date: null };
                return {
                    ...cust,
                    orders_count: stats.count,
                    total_ltv: stats.ltv,
                    last_order_date: stats.last_date,
                };
            });

            setCustomers(customersWithStats);

        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Handle Submit do Search (para evitar requisições a cada tecla)
    const onSubmitSearch = () => {
        fetchCustomers(searchQuery);
    };

    // Formatação
    function formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }

    function formatCpf(cpf: string | null): string {
        if (!cpf) return '—';
        const clean = cpf.replace(/\D/g, '');
        if (clean.length !== 11) return cpf;
        return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
    }

    // Calculo Geral
    const totalCustomers = customers.length;
    const totalOrdersGlob = customers.reduce((acc, c) => acc + c.orders_count, 0);
    const totalLtvGlob = customers.reduce((acc, c) => acc + c.total_ltv, 0);

    const renderItem = ({ item }: { item: CustomerWithStats }) => (
        <TouchableOpacity
            className="bg-dark p-4 rounded-2xl border border-gray-800 mb-4 shadow-sm"
            onPress={() => console.log('Detalhes do cliente', item.id)}
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-2">
                    <Text className="text-white font-bold text-lg mb-0.5" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-gray-400 text-xs font-mono">{formatCpf(item.document_id)}</Text>
                </View>
                <View className="bg-primary-500/20 px-2.5 py-1 rounded-full items-center justify-center flex-row">
                    <MaterialIcons name="build-circle" size={14} color="#22c55e" style={{ marginRight: 4 }} />
                    <Text className="text-primary-500 font-bold text-xs">{item.orders_count} O.S</Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center bg-darker p-3 rounded-xl border border-gray-800/60 mt-2">
                <View>
                    <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Contato</Text>
                    <Text className="text-gray-300 text-sm font-medium">{item.phone || '—'}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Geração (LTV)</Text>
                    <Text className="text-green-500 text-sm font-bold tracking-tight">{formatCurrency(item.total_ltv)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-darker">
            {/* Header / Nav */}
            <View className="px-5 pt-6 pb-4 bg-dark border-b border-gray-800 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full bg-darker">
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text className="text-white text-xl font-bold tracking-tight">Clientes</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">Sua base (C.R.M)</Text>
                </View>
            </View>

            {/* Metrics Header */}
            <View className="px-5 py-5 flex-row justify-between">
                <View className="items-center bg-dark px-4 py-3 rounded-2xl border border-gray-800 w-[30%]">
                    <MaterialIcons name="people" size={22} color="#3b82f6" className="mb-1" />
                    <Text className="text-white font-bold text-lg">{totalCustomers}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold mt-1">TOTAL</Text>
                </View>
                <View className="items-center bg-dark px-4 py-3 rounded-2xl border border-gray-800 w-[30%]">
                    <MaterialIcons name="fact-check" size={22} color="#a855f7" className="mb-1" />
                    <Text className="text-white font-bold text-lg">{totalOrdersGlob}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold mt-1">O.S FIN.</Text>
                </View>
                <View className="items-center bg-dark px-4 py-3 rounded-2xl border border-gray-800 w-[36%]">
                    <MaterialIcons name="monetization-on" size={22} color="#22c55e" className="mb-1" />
                    <Text className="text-white font-bold text-lg" numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalLtvGlob)}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold mt-1">RECEITA</Text>
                </View>
            </View>

            {/* Content Body */}
            <View className="flex-1 px-5">
                {/* Search Bar */}
                <View className="bg-dark flex-row items-center px-4 py-3 rounded-2xl border border-gray-800 mb-6 shadow-sm">
                    <MaterialIcons name="search" size={22} color="#64748b" />
                    <TextInput
                        className="flex-1 ml-3 text-white text-base font-medium"
                        placeholder="Buscar cliente (Nome, CPF)"
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={onSubmitSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); fetchCustomers(); }}>
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
                ) : customers.length === 0 ? (
                    <View className="flex-1 justify-center items-center pb-20">
                        <MaterialIcons name="person-search" size={64} color="#334155" />
                        <Text className="text-white font-bold mt-6 text-lg">Nenhum cliente encontrado.</Text>
                        <Text className="text-gray-500 mt-2 text-center text-sm tracking-wide max-w-[250]">
                            Os clientes são criados no sistema automaticamente ao abrir uma O.S.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={customers}
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
