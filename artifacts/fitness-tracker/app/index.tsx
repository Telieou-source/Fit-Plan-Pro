import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function IndexRedirect() {
  const { profile, isLoaded } = useAppContext();
  const colors = useColors();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
