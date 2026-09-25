const API_URL = "http://10.0.2.2:3000";

export async function registerNotificationSubscription(subscription: any) {
  const response = await fetch(`${API_URL}/notification-subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });

  return response.json();
}
