import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { searchCity, CitySuggestion } from "../services/ilMeteoService";

type Props = {
  localita: string;
  setLocalita: (valore: string) => void;
};

export default function LocationInput({ localita, setLocalita }: Props) {
  const [testo, setTesto] = useState(localita);
  const [suggerimenti, setSuggerimenti] = useState<CitySuggestion[]>([]);
  const [ricercaInCorso, setRicercaInCorso] = useState(false);

  const handleTestoChange = async (nuovoTesto: string) => {
    setTesto(nuovoTesto);

    if (nuovoTesto.trim().length < 2) {
      setSuggerimenti([]);
      return;
    }

    setRicercaInCorso(true);

    try {
      const risultati = await searchCity(nuovoTesto);
      setSuggerimenti(risultati);
    } finally {
      setRicercaInCorso(false);
    }
  };

  const selezionaLocalita = (localitaScelta: CitySuggestion) => {
    setTesto(localitaScelta.nome);
    setLocalita(localitaScelta.nome);
    setSuggerimenti([]);
  };

  return (
    <View
      style={{
        marginBottom: 20,
        zIndex: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 56,
        }}
      >
        <TextInput
          value={testo}
          onChangeText={handleTestoChange}
          placeholder="Inserisci località"
          autoCorrect={false}
          style={{
            flex: 1,
            fontSize: 16,
            paddingVertical: 12,
          }}
        />

        {ricercaInCorso && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      {suggerimenti.length > 0 && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: "white",
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          {suggerimenti.map((suggerimento) => (
            <Pressable
              key={suggerimento.id}
              onPress={() => selezionaLocalita(suggerimento)}
              style={({ pressed }) => ({
                padding: 12,
                backgroundColor: pressed ? "#eff6ff" : "white",
                borderBottomWidth: 1,
                borderBottomColor: "#e2e8f0",
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                }}
              >
                {suggerimento.nome}
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                {suggerimento.provincia} · {suggerimento.regione}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {testo.trim().length >= 2 &&
        !ricercaInCorso &&
        suggerimenti.length === 0 &&
        testo !== localita && (
          <Text
            style={{
              marginTop: 6,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Nessuna località trovata
          </Text>
        )}
    </View>
  );
}
