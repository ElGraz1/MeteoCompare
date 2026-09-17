import {
  View,
  Text,
  Pressable,
  TextInput,
} from "react-native";

import { useState } from "react";
import LocationInput from "../components/LocationInput";
import { getForecasts } from "../services/forecastService";
import {
  getForecastsByCity,
} from "../services/apiForecastService";
import { Image } from "react-native";
import { weatherIcons } from "../constants/weatherIcons";

import { useEffect } from "react";

export default function HomeScreen() {




  const [orariAperti, setOrariAperti] = useState<string[]>([]);
  const toggleOrario = (ora: string) => {
  if (orariAperti.includes(ora)) {
    setOrariAperti(
      orariAperti.filter((o) => o !== ora)
    );
  } else {
    setOrariAperti([...orariAperti, ora]);
  }
};
  const [localita, setLocalita] = useState("Milano");
  const [risoluzione, setRisoluzione] = useState("oraria");
  const [giorno, setGiorno] = useState("Oggi");
  const [
  confrontoCorrente,
  setConfrontoCorrente,
] = useState<any[]>([]);



useEffect(() => {

  
const dayMap: Record<string, number> = {
  "Oggi": 0,
  "Domani": 1,
  "+2": 2,
  "+3": 3,
  "+4": 4,
  "+5": 5,
  "+6": 6,
};

const day =
  dayMap[giorno] ?? 0;


  getForecastsByCity(localita, day)
    .then((result) => {

      setConfrontoCorrente(
        result.confronto
      );

    })
    .catch((error) => {

      console.error(
        error
      );

    });

}, [localita, giorno]);
  const giorni = [
  "Oggi",
  "Domani",
  "+2",
  "+3",
  "+4",
  "+5",
  "+6",
]

// const confrontoCorrente =
//   getForecasts(giorno);


  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#f1f5f9",
      }}
    >
    <LocationInput
    localita={localita}
    setLocalita={setLocalita}
    />

    <View
  style={{
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  }}
>
  <Pressable
    onPress={() => setRisoluzione("oraria")}
    style={{
      backgroundColor:
        risoluzione === "oraria"
          ? "#2563eb"
          : "#e5e7eb",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    }}
  >
    <Text
      style={{
        color:
          risoluzione === "oraria"
            ? "white"
            : "black",
      }}
    >
      Oraria
    </Text>
  </Pressable>

  <Pressable
    onPress={() => setRisoluzione("trioraria")}
    style={{
      backgroundColor:
        risoluzione === "trioraria"
          ? "#2563eb"
          : "#e5e7eb",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    }}
  >
    <Text
      style={{
        color:
          risoluzione === "trioraria"
            ? "white"
            : "black",
      }}
    >
      Trioraria
    </Text>
  </Pressable>
</View>

<View
  style={{
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  }}

  // {giorni.map((g) => (
  //<Pressable
  //key={g}
    //  onPress={() => setGiorno(g)} 

>
{giorni.map((g) => (
  <Pressable
    key={g}
    onPress={() => {
      setGiorno(g);
    }}
      style={{
        backgroundColor:
          giorno === g ? "#2563eb" : "#e5e7eb",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          color: giorno === g ? "white" : "black",
        }}
      >
        {g}
      </Text>
    </Pressable>
  ))}
</View>


      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
       📍 {localita}
       <Text
  style={{
    fontSize: 18,
    marginBottom: 10,
    color: "#2563eb",
    fontWeight: "bold",
  }}
>
  Giorno selezionato: {giorno}
</Text>
      </Text>

<View
  style={{
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
  }}
>
  <Text
    style={{
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
    }}
  >
    Confronto previsioni
  </Text>

  {confrontoCorrente.map((item) => (
    <View
      key={item.ora}
      style={{
        marginBottom: 15,
      }}
    >
      <Pressable
        onPress={() => {
  if (
    item.ilMeteo.probabilita > 0 ||
    item.ilMeteo.accumulo > 0 ||
    (item.treBMeteo?.probabilita ?? 0) > 0 ||
    (item.treBMeteo?.accumulo ?? 0) > 0
  ) {
    toggleOrario(item.ora);
  }
}}
      >
 <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  }}
>
  <Image
    source={
      weatherIcons[
        item.ilMeteo.codiceIcona
      ]
    }
    style={{
      width: 24,
      height: 24,
    }}
  />

  <Text>
    {item.ora}{" "}
    {item.ilMeteo.temperatura}°C /
    {item.treBMeteo?.temperatura}°C{" "}     
    {item.ilMeteo.probabilita > 0 ||
 item.ilMeteo.accumulo > 0 ||
 (item.treBMeteo?.probabilita ?? 0) > 0 ||
 (item.treBMeteo?.accumulo ?? 0) > 0
  ? (orariAperti.includes(item.ora)
      ? "▲"
      : "▼")
  : ""}{" "}
          {item.alert ? "⚠️" : ""}
        </Text>
      </View>
      </Pressable>

      {orariAperti.includes(item.ora) && (
        <View
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#f8fafc",
            borderRadius: 10,
          }}
        >
         <View
  style={{
    flexDirection: "row",
    justifyContent: "space-around",
  }}
>
  <View
    style={{
      alignItems: "center",
    }}
  >
    <Text>iLM</Text>
    <Text>
      {item.ilMeteo.probabilita}%
    </Text>

    <Text>
      {item.ilMeteo.accumulo} mm
    </Text>
  </View>

  <View
    style={{
      alignItems: "center",
    }}
  >
    <Text>3BM</Text>

    <Text>
      {item.treBMeteo?.probabilita}%
    </Text>

    <Text>
      {item.treBMeteo?.accumulo} mm
    </Text>
  </View>
</View>
        </View>
      )}
    </View>
  ))}
</View>


    </View>

  );
}