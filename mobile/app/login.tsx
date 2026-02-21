import "../global.css";
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../ctx';
import { useState } from 'react';
import { router } from 'expo-router';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao entrar', error.message);
    } else {
      router.replace('/(app)/(tabs)');
    }
  };

  return (
    <View className="flex-1 bg-darker items-center justify-center p-8">
      <View className="w-full max-w-sm">
        <Text className="text-5xl text-primary-500 font-extrabold text-center mb-2 tracking-tighter">
          WFIX<Text className="text-white">Tech</Text>
        </Text>
        <Text className="text-gray-400 text-center mb-12 text-lg">
          Gestão empresarial na palma da sua mão.
        </Text>

        <View className="w-full">
          <View className="bg-dark rounded-2xl border border-gray-800 flex-row items-center px-4 mb-4">
            <TextInput
              placeholder="Seu e-mail profissional"
              placeholderTextColor="#64748b"
              className="flex-1 text-white py-4 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="bg-dark rounded-2xl border border-gray-800 flex-row items-center px-4 mb-8">
            <TextInput
              placeholder="Senha de acesso"
              placeholderTextColor="#64748b"
              secureTextEntry
              className="flex-1 text-white py-4 text-base"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`bg-primary-500 py-4 rounded-2xl items-center shadow-lg shadow-primary-500/20 active:bg-primary-600 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text className="text-darker font-bold text-lg">Acessar Sistema</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row justify-center space-x-2">
          <Text className="text-gray-500">Problemas para acessar?</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-semibold">Fale com suporte</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="light" />
    </View>
  );
}
