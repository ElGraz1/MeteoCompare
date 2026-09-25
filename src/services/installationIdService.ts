import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getInstallationId() {
  const existingId = await AsyncStorage.getItem("installationId");

  if (existingId) {
    return existingId;
  }

  const newId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  await AsyncStorage.setItem("installationId", newId);

  return newId;
}
