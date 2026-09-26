const API_URL = "https://site--meteocompare-api--ddx7k442y97b.code.run";

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
