import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StaffProvider } from './src/context/StaffContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StaffProvider>
        <AppNavigator />
      </StaffProvider>
    </SafeAreaProvider>
  );
}
