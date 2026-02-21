import "../global.css";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../ctx';
import { router } from 'expo-router';

type AuthMode = 'tech' | 'client';

export default function Login() {
  const { signIn, signInWithOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleTechLogin = async () => {
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
      router.replace('/(app)');
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Erro', 'Preencha o seu e-mail!');
      return;
    }
    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao enviar código', error.message);
    } else {
      setOtpSent(true);
      Alert.alert('Código enviado', 'Verifique sua caixa de entrada.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!token) {
      Alert.alert('Erro', 'Preencha o código recebido!');
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(email, token);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao validar código', error.message);
    } else {
      router.replace('/(app)');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-darker">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View className="w-full max-w-sm">
          <Text className="text-5xl text-primary-500 font-extrabold text-center mb-2 tracking-tighter">
            WFIX<Text className="text-white">Tech</Text>
          </Text>
          <Text className="text-gray-400 text-center mb-10 text-lg">
            Acompanhe o status do seu equipamento.
          </Text>

          {/* Abas de Seleção */}
          <View className="flex-row bg-dark rounded-xl p-1 mb-8 border border-gray-800">
            <TouchableOpacity
              onPress={() => { setAuthMode('client'); setOtpSent(false); }}
              className={`flex-1 py-3 rounded-lg items-center ${authMode === 'client' ? 'bg-primary-500' : 'bg-transparent'}`}
            >
              <Text className={`font-bold ${authMode === 'client' ? 'text-darker' : 'text-gray-400'}`}>Sou Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setAuthMode('tech'); setOtpSent(false); }}
              className={`flex-1 py-3 rounded-lg items-center ${authMode === 'tech' ? 'bg-primary-500' : 'bg-transparent'}`}
            >
              <Text className={`font-bold ${authMode === 'tech' ? 'text-darker' : 'text-gray-400'}`}>Sou Técnico</Text>
            </TouchableOpacity>
          </View>

          <View className="w-full">
            <View className="bg-dark rounded-2xl border border-gray-800 flex-row items-center px-4 mb-4">
              <TextInput
                placeholder="Seu e-mail"
                placeholderTextColor="#64748b"
                className="flex-1 text-white py-4 text-base"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!otpSent} // Bloqueia edição de email se o OTP já foi enviado
              />
            </View>

            {authMode === 'tech' && (
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
            )}

            {authMode === 'client' && otpSent && (
              <View className="bg-dark rounded-2xl border border-gray-800 flex-row items-center px-4 mb-8">
                <TextInput
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white py-4 text-center text-xl tracking-widest font-bold"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={token}
                  onChangeText={setToken}
                />
              </View>
            )}

            {/* Renderização Condicional do Botão */}
            {authMode === 'tech' ? (
              <TouchableOpacity
                onPress={handleTechLogin}
                disabled={loading}
                className={`bg-primary-500 py-4 rounded-2xl items-center shadow-lg shadow-primary-500/20 active:bg-primary-600 ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-darker font-bold text-lg">Acessar Sistema</Text>}
              </TouchableOpacity>
            ) : (
              !otpSent ? (
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={loading}
                  className={`bg-primary-500 py-4 rounded-2xl items-center shadow-lg shadow-primary-500/20 active:bg-primary-600 ${loading ? 'opacity-70' : ''}`}
                >
                  {loading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-darker font-bold text-lg">Receber Código de Acesso</Text>}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  className={`bg-primary-500 py-4 rounded-2xl items-center shadow-lg shadow-primary-500/20 active:bg-primary-600 ${loading ? 'opacity-70' : ''}`}
                >
                  {loading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-darker font-bold text-lg">Validar Código</Text>}
                </TouchableOpacity>
              )
            )}
          </View>

          {authMode === 'client' && otpSent && (
            <View className="mt-8 flex-row justify-center space-x-2">
              <Text className="text-gray-500">Não recebeu o e-mail?</Text>
              <TouchableOpacity onPress={() => setOtpSent(false)}>
                <Text className="text-primary-500 font-semibold">Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}
