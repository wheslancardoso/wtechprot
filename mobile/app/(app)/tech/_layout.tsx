import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../ctx';
import { View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';

export default function TechDrawerLayout() {
    const { signOut } = useAuth();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props: any) => (
                    <DrawerContentScrollView {...props}>
                        <DrawerItemList {...props} />
                        <View className="mt-4 border-t border-gray-800 pt-4">
                            <DrawerItem
                                label="Configurações"
                                icon={({ color, size }: { color: string, size: number }) => <MaterialIcons name="settings" size={size} color={color} />}
                                onPress={() => router.push('/(app)/tech/settings')}
                                labelStyle={{ fontWeight: '600', marginLeft: -16, color: '#94a3b8' }}
                            />
                            <DrawerItem
                                label="Sair"
                                icon={({ color, size }: { color: string, size: number }) => <MaterialIcons name="logout" size={size} color="#ef4444" />}
                                onPress={() => signOut()}
                                labelStyle={{ fontWeight: '600', marginLeft: -16, color: '#ef4444' }}
                            />
                        </View>
                    </DrawerContentScrollView>
                )}
                screenOptions={{
                    headerStyle: { backgroundColor: '#0f172a' },
                    headerTintColor: '#fff',
                    drawerStyle: { backgroundColor: '#0f172a', width: 280 },
                    drawerActiveTintColor: '#22c55e',
                    drawerInactiveTintColor: '#94a3b8',
                    drawerLabelStyle: { fontWeight: '600', marginLeft: -16 },
                }}
            >
                <Drawer.Screen
                    name="tabs"
                    options={{
                        headerShown: true,
                        drawerLabel: 'Início',
                        title: 'WFIX Tech',
                        drawerIcon: ({ color, size }: { color: string, size: number }) => <MaterialIcons name="home" size={size} color={color} />
                    }}
                />
                <Drawer.Screen
                    name="leads/index"
                    options={{
                        drawerLabel: 'Leads B2B',
                        title: 'Leads B2B',
                        drawerIcon: ({ color, size }: { color: string, size: number }) => <MaterialIcons name="business" size={size} color={color} />
                    }}
                />
                <Drawer.Screen
                    name="feedbacks/index"
                    options={{
                        drawerLabel: 'Feedbacks',
                        title: 'Feedbacks',
                        drawerIcon: ({ color, size }: { color: string, size: number }) => <MaterialIcons name="star-rate" size={size} color={color} />
                    }}
                />
                <Drawer.Screen
                    name="metrics/index"
                    options={{
                        drawerLabel: 'Métricas',
                        title: 'Métricas de Performance',
                        drawerIcon: ({ color, size }: { color: string, size: number }) => <MaterialIcons name="insert-chart" size={size} color={color} />
                    }}
                />
                <Drawer.Screen
                    name="catalog/index"
                    options={{
                        drawerLabel: 'Catálogo',
                        title: 'Catálogo',
                        drawerIcon: ({ color, size }: { color: string, size: number }) => <MaterialIcons name="inventory" size={size} color={color} />
                    }}
                />
                <Drawer.Screen
                    name="settings/index"
                    options={{
                        drawerItemStyle: { display: 'none' },
                        title: 'Configurações'
                    }}
                />

                <Drawer.Screen
                    name="orders/new"
                    options={{
                        drawerItemStyle: { display: 'none' },
                        title: 'Nova O.S'
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
