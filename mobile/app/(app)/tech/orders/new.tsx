import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NewOrderScreen() {
    return (
        <View className="flex-1 bg-darker p-4">
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Nova Ordem de Serviço</Text>
            </View>

            <View className="bg-dark p-6 rounded-2xl border border-gray-800 items-center justify-center flex-1">
                <MaterialIcons name="add-task" size={48} color="#64748b" />
                <Text className="text-white text-lg font-bold mt-4">Abertura de O.S.</Text>
                <Text className="text-gray-400 mt-2 text-center text-sm">
                    Aqui o Técnico poderá preencher um formulário offline/online para dar entrada num equipamento e associá-lo a um cliente. (Em desenvolvimento)
                </Text>
            </View>
        </View>
    );
}
