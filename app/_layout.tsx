import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#2872A1' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{
              title: 'Dépenses',
              headerRight: () => {
                const router = useRouter();
                return (
                  <TouchableOpacity 
                    onPress={() => router.push('/shopping')} 
                    style={{ 
                      marginRight: 15,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 18,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🛒</Text>
                  </TouchableOpacity>
                );
              },
            }}
          />
          <Stack.Screen 
            name="shopping" 
            options={{ 
              title: 'Liste de course',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}