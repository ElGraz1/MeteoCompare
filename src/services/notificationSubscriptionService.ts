const API_URL = "http://10.0.2.2:3000";

export async function registerNotificationSubscription() {
  const response = await fetch(`${API_URL}/notification-subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      test: true,
      city: "Caltanissetta",
    }),
  });

  return response.json();
}
