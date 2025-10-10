import React, { useState, useEffect } from "react";
import { Header, Icon, Overlay } from "react-native-elements";
import { useSelector } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ModalSelector from "react-native-modal-selector";
import { KeyboardAwareScrollView } from "@codler/react-native-keyboard-aware-scroll-view";
import {
  View,
  Text,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import moment from "moment";
import CreateProgrammingServices from "../../services/createProgrammingServices";
import { GooglePlacesComponent } from "../../components/GooglePlacesComponent";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { helpers } from "../../utils/helpers";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Calendar } from "react-native-calendars";
import { RootState } from '../../redux/store';

// Interfaces TypeScript
interface Route {
  id: string;
  key?: string;
  label?: string;
  origin: {
    id: string;
    name: string;
  };
  destination: {
    id: string;
    name: string;
  };
}

interface Bus {
  id: string;
  key?: string;
  label?: string;
  name: string;
  images: Array<{
    id: string;
    url: string;
  }>;
  capacity: number;
  placa: string;
  type: string;
}

interface Driver {
  id: string;
  key?: string;
  label?: string;
  names: string;
  phone: string;
  email: string;
  profile: string;
  deviceId: string;
  status: string;
}

interface Place {
  name: string;
  [key: string]: any;
}

interface ImageOption {
  name: string;
  file: string;
  fileF: any;
  base64: string;
}

interface CreateProgrammingProps {
  navigation?: any;
}

const { height, width } = Dimensions.get("window");

const CreateProgramming: React.FC<CreateProgrammingProps> = () => {
  // ✅ Usar useLocalSearchParams de Expo Router
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // ✅ Obtener userId desde params
  const userIdFromParams = params.userId as string;
  const userNameFromParams = params.userName as string;
  
  // Intentar obtener desde Redux también (como fallback)
  const userFromId = useSelector((state: RootState) => state.id);
  const sessionState = useSelector((state: RootState) => state.session);
  const navPages = useSelector((state: RootState) => state.navPages);

  console.log("🔍 DEBUG params de Expo Router:", JSON.stringify(params, null, 2));
  console.log("🔍 DEBUG userId desde params:", userIdFromParams);
  console.log("🔍 DEBUG state.id:", JSON.stringify(userFromId, null, 2));
  console.log("🔍 DEBUG state.session:", JSON.stringify(sessionState, null, 2));
  
  // ✅ Función para buscar el usuario en todas las ubicaciones posibles
  const getUser = () => {
    // Prioridad 1: userId desde params de navegación de Expo Router
    if (userIdFromParams) {
      console.log("✅ UserId encontrado en Expo Router params");
      return { _id: userIdFromParams, names: userNameFromParams };
    }
    
    // Prioridad 2: state.id es un objeto con datos del usuario
    if (userFromId && typeof userFromId === 'object' && !Array.isArray(userFromId)) {
      if (userFromId._id || userFromId.id || userFromId.idUser) {
        console.log("✅ Usuario encontrado en state.id");
        return userFromId;
      }
    }
    
    // Prioridad 3: Buscar en session
    if (sessionState && typeof sessionState === 'object') {
      if (sessionState._id || sessionState.id) {
        console.log("✅ Usuario encontrado en state.session");
        return sessionState;
      }
      if (sessionState.user && (sessionState.user._id || sessionState.user.id)) {
        console.log("✅ Usuario encontrado en state.session.user");
        return sessionState.user;
      }
      if (sessionState.userData && (sessionState.userData._id || sessionState.userData.id)) {
        console.log("✅ Usuario encontrado en state.session.userData");
        return sessionState.userData;
      }
    }
    
    console.error("❌ No se encontró el usuario en ninguna ubicación conocida");
    return null;
  };
  
  const user = getUser();
  const userId = user?._id || user?.id || user?.idUser;
  
  console.log("🔍 Usuario encontrado:", user ? "SÍ" : "NO");
  console.log("🔍 userId calculado final:", userId);

  // Estado local
  const [modalRecogida, setModalRecogida] = useState<boolean>(false);
  const [modalPuntoFnal, setModalPuntoFnal] = useState<boolean>(false);
  
  // data
  const [listBuses, setListBuses] = useState<Bus[]>([]);
  const [listRutas, setListRutas] = useState<Route[]>([]);
  const [listConductores, setListConductores] = useState<Driver[]>([]);

  // userTextInput
  const [rutaSelected, setRutaSelected] = useState<any>({
    key: "-1",
    label: "Debes seleccionar una ruta",
  });
  const [busSelected, setBusSelected] = useState<any>({
    key: "-1",
    label: "Debes seleccionar un bus",
    capacity: 0,
  });
  const [conductorSelected, setConductorSelected] = useState<any>({
    key: "-1",
    label: "Debes seleccionar un Conductor",
  });

  const [startDate, setStartDate] = useState<string>(moment(new Date()).format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(moment(new Date()).format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [horaSalida, setHoraSalida] = useState<string>("");
  const [horaLlegada, setHoraLlegada] = useState<string>("");
  const [DatePickerVisibility, setDatePickerVisibility] = useState<boolean>(false);
  const [DatePickerVisibleLlegada, setDatePickerVisibleLlegada] = useState<boolean>(false);
  const [statusCalendar, setStatusCalendar] = useState<boolean>(false);
  const [isStartDatePicked, setIsStartDatePicked] = useState<boolean>(false);
  const [isEndDatePicked, setIsEndDatePicked] = useState<boolean>(false);

  const [ruta, setRuta] = useState<string>("");
  const [vehiculo, setVehiculo] = useState<string>("");
  const [conductor, setConductor] = useState<string>("");
  const [disponibles, setDisponibles] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [dcto, setDcto] = useState<boolean>(false);
  const [documentacion, setDocumentacion] = useState<boolean>(false);
  const [precioDcto, setPrecioDcto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place>({} as Place);
  const [imgPrincipal, setImgPrincipal] = useState<ImageOption | null>(null);
  const [imgBanner, setImgBanner] = useState<ImageOption | null>(null);
  const [imgGallery, setImgGallery] = useState<ImageOption[]>([]);

  // Métodos
  const getData = () => {
    console.log("📋 Iniciando carga de datos...");
    console.log("👤 Usuario ID final a usar:", userId);
    
    if (!userId) {
      console.error("❌ ERROR: No se pudo obtener el ID del usuario");
      console.error("🔍 Usuario completo:", user);
      console.error("🔍 state.id:", userFromId);
      console.error("🔍 state.session:", sessionState);
      
      Alert.alert(
        "Error de sesión", 
        "No se pudo identificar al usuario. Por favor, cierra sesión y vuelve a iniciar sesión.",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
      return;
    }
    
    getRoutes(userId);
  };

  const getRoutes = (userIdParam: string) => {
    CreateProgrammingServices.getRoutesEnabled()
      .then((result: Route[]) => {
        console.log("✅ Rutas obtenidas:", result.length);
        const formattedRoutes = result.map(route => ({
          ...route,
          key: route.id,
          label: `${route.origin.name}-${route.destination.name}`,
        }));
        setListRutas(formattedRoutes);
        getBuses(userIdParam);
      })
      .catch((err) => {
        console.error("❌ Error al obtener rutas:", err);
        getBuses(userIdParam);
      });
  };

  const getBuses = (userIdParam: string) => {
    console.log("🚌 Obteniendo buses para usuario:", userIdParam);
    CreateProgrammingServices.getBusesEnable(userIdParam)
      .then((res: Bus[]) => {
        console.log("✅ Buses obtenidos:", res.length);
        console.log("📊 Datos de buses:", res);
        const formattedBuses = res.map(bus => ({
          ...bus,
          key: bus.id,
          label: bus.name,
        }));
        setListBuses(formattedBuses);
        getDrivers(userIdParam);
      })
      .catch((error) => {
        console.error("❌ Error al obtener buses:", error);
        getDrivers(userIdParam);
      });
  };

  const getDrivers = (userIdParam: string) => {
    console.log("👨‍✈️ Obteniendo conductores para usuario:", userIdParam);
    CreateProgrammingServices.getDriversEnable(userIdParam)
      .then((res: Driver[]) => {
        console.log("✅ Conductores obtenidos:", res.length);
        console.log("📊 Datos de conductores:", res);
        const formattedDrivers = res.map(driver => ({
          ...driver,
          key: driver.id,
          label: driver.names,
        }));
        setListConductores(formattedDrivers);
      })
      .catch((error) => {
        console.error("❌ Error al obtener conductores:", error);
      });
  };

  const onDayPress = (day: { dateString: string }) => {
    if (!isStartDatePicked || moment(day.dateString) < moment(startDate)) {
      const newMarkedDates = {
        [day.dateString]: {
          startingDay: true,
          color: "orange",
          textColor: "#FFFFFF",
        },
      };
      setMarkedDates(newMarkedDates);
      setIsStartDatePicked(true);
      setIsEndDatePicked(false);
      setStartDate(day.dateString);
      setEndDate(day.dateString);
    } else {
      const newMarkedDates = { ...markedDates };
      const startDateMoment = moment(startDate);
      const endDate1 = moment(day.dateString);
      const range = endDate1.diff(startDateMoment, "days");
      
      setEndDate(day.dateString);
      
      if (range > 0) {
        let tempDate = startDateMoment;
        for (let i = 1; i <= range; i++) {
          tempDate = tempDate.add(1, "day");
          const tempDateStr = moment(tempDate).format("YYYY-MM-DD");
          if (i < range) {
            newMarkedDates[tempDateStr] = { color: "orange", textColor: "#FFFFFF" };
          } else {
            newMarkedDates[tempDateStr] = {
              endingDay: true,
              color: "orange",
              textColor: "#FFFFFF",
            };
          }
        }
        setMarkedDates(newMarkedDates);
        setIsStartDatePicked(false);
        setIsEndDatePicked(true);
      }
    }
  };

  const savePlaces = (newPlaces: Place[]) => {
    console.log("📍 Puntos de recogida guardados:", newPlaces);
    if (newPlaces && Array.isArray(newPlaces)) {
      setPlaces(newPlaces);
    } else {
      console.warn("⚠️ savePlaces recibió datos inválidos:", newPlaces);
      setPlaces([]);
    }
  };
  
  const savePlacesFinal = (newPlace: Place[]) => {
    console.log("📍 Punto final guardado:", newPlace);
    if (newPlace && Array.isArray(newPlace) && newPlace.length > 0) {
      setPlace(newPlace[0]);
    } else {
      console.warn("⚠️ savePlacesFinal recibió datos inválidos:", newPlace);
      setPlace({} as Place);
    }
  };

  const closeModal = () => {
    setModalRecogida(false);
    setModalPuntoFnal(false);
  };

  const chooseImage = async (type: string, limit: number) => {
    try {
      const resp = await helpers.pickImages(limit, [4, 3]);
      
      let url = resp.uri[0];
      let base64 = resp.base64;
      let fileF = resp.file;

      const options: ImageOption = {
        name: type,
        file: url,
        fileF: fileF,
        base64,
      };

      switch (type) {
        case "principal":
          setImgPrincipal(options);
          break;
        case "banner":
          setImgBanner(options);
          break;
        case "gallery":
          let gallery = [...imgGallery];
          if (gallery.length > 5) gallery.shift();
          gallery.push(options);
          setImgGallery(gallery);
          break;
      }
    } catch (error) {
      console.error("Error choosing image:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const sendUpload = async (id: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (imgPrincipal) {
          const uploadedImgPrincipal = await helpers.uploadImages(
            imgPrincipal,
            id,
            "destino",
            place.name || "programacion", 
            "principal"
          );
          setImgPrincipal(uploadedImgPrincipal);
        }

        if (imgBanner) {
          const uploadedImgBanner = await helpers.uploadImages(
            imgBanner,
            id,
            "destino",
            place.name || "programacion",
            "banner"
          );
          setImgBanner(uploadedImgBanner);
        }

        let uploadedGallery = [];
        for (let i = 0; i < imgGallery.length; i++) {
          let img = await helpers.uploadImages(
            imgGallery[i],
            id,
            "destino",
            place.name || "programacion",
            "gallery"
          );
          uploadedGallery.push(img);
        }
        setImgGallery(uploadedGallery);

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  const onHandleSubmit = () => {
    console.log("----------------------ENTRO A ONHANDLESUBMIT-------------------");
    
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }
    
    let mensajesDeError: string[] = [];

    let obj = {
      end: "",
      start: "",
      id: userId,
      ruta: "",
      vehiculo: "",
      conductor: "",
      disponibles: "",
      precio: "",
      dcto: dcto,
      precioDcto: "",
      documentacion: documentacion,
      places: [] as Place[],
      place: {} as Place,
      descripcion: "",
      images: "",
      banner: "",
    };

    // Validaciones
    if (ruta !== "0" && ruta !== "") {
      obj.ruta = ruta;
    } else {
      mensajesDeError.push("* Debe seleccionar una ruta.");
    }

    if (vehiculo !== "0" && vehiculo !== "") {
      obj.vehiculo = vehiculo;
    } else {
      mensajesDeError.push("* Debe seleccionar un vehículo.");
    }

    if (conductor !== "0" && conductor !== "") {
      obj.conductor = conductor;
    } else {
      mensajesDeError.push("* Debe seleccionar un conductor.");
    }

    if (disponibles !== "" && Number(disponibles) > 0 && Number(disponibles) <= (busSelected.capacity || 0)) {
      obj.disponibles = disponibles;
    } else {
      mensajesDeError.push("* Debe poner el número de asientos válido.");
    }

    if (dcto) {
      if (precioDcto !== "" && Number(precioDcto) > 0) {
        obj.precioDcto = precioDcto;
      } else {
        mensajesDeError.push("* Debe poner el precio del descuento.");
      }
    }

    if (precio !== "" && Number(precio) > 0) {
      obj.precio = precio;
    } else {
      mensajesDeError.push("* Debe poner el precio comercial.");
    }

    if (descripcion.trim() !== "") {
      obj.descripcion = descripcion;
    } else {
      mensajesDeError.push("* Debe poner la descripción del paquete.");
    }

    if (places.length !== 0) {
      obj.places = places;
    } else {
      mensajesDeError.push("* Debe seleccionar los puntos de recogida.");
    }

    if (Object.keys(place).length !== 0 && place.name) {
      obj.place = place;
    } else {
      mensajesDeError.push("* Debe poner el punto de llegada.");
    }

    if (startDate.trim().length !== 0 && horaSalida.trim().length !== 0) {
      obj.start = `${startDate}T${horaSalida}:00.000+00:00`;
    } else {
      mensajesDeError.push("* Debe seleccionar una fecha y hora de salida.");
    }

    if (endDate.trim().length !== 0 && horaLlegada.trim().length !== 0) {
      obj.end = `${endDate}T${horaLlegada}:00.000+00:00`;
    } else {
      mensajesDeError.push("* Debe seleccionar una fecha y hora de llegada.");
    }

    console.log("----------------------estos son mis datos-------------------", obj);

    if (mensajesDeError.length !== 0) {
      Alert.alert("Alerta", mensajesDeError.join("\n"));
    } else {
      Alert.alert(
        "Confirmar",
        "¿Estás seguro de que quieres crear esta programación?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Crear",
            onPress: () => {
              if (!userId) {
                Alert.alert("Error", "No se pudo identificar al usuario");
                return;
              }
              
              sendUpload(userId).then((resp) => {
                obj.images = imgPrincipal?.file || "";
                obj.banner = imgBanner?.file || "";
                
                console.log("----------------obj justo antes de enviar", obj);
                      
                CreateProgrammingServices.createProgramming(obj).then((resp) => {
                  console.log("-------respuesta de la creacion del programacion ", resp);
                  Alert.alert("Éxito", "Programación creada correctamente");
                  router.back();
                }).catch((e) => {
                  console.log("error", e);
                  Alert.alert("Error", "No se pudo crear la programación");
                });  
              }).catch((e) => {
                console.log("error", e);
                Alert.alert("Error", "Error al subir las imágenes");
              });
            }
          }
        ]
      );
    }
  };

  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedTime = `${formattedHour}:${formattedMinutes}`;
    setHoraSalida(formattedTime);
  };

  const handleConfirmLlegada = (date: Date) => {
    setDatePickerVisibleLlegada(false);
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedTime = `${formattedHour}:${formattedMinutes}`;
    setHoraLlegada(formattedTime);
  };

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={{ backgroundColor: "#4f4f4f", flex: 1 }}>
      <StatusBar barStyle={"light-content"} />

      <Header containerStyle={styles.containerHeader}>
        <View style={styles.header}>
          <Text style={[styles.colorW, { fontSize: height * 0.03 }]}>
            Crear programación
          </Text>
        </View>

        <View style={styles.icon}>
          <TouchableOpacity onPress={handleGoBack}>
            <FontAwesome5
              style={{ borderRadius: 100 }}
              name={"arrow-left"}
              size={width * 0.1}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </Header>

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        contentContainerStyle={{ flexGrow: 1 }}
        enableAutomaticScroll={true}
        viewIsInsideTabBar={false}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView style={styles.container}>
            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Selecciona una ruta
              </Text>
              <ModalSelector
                data={listRutas}
                onChange={(option: any) => {
                  console.log("✅ Ruta seleccionada:", option);
                  setRutaSelected(option);
                  setRuta(option.key || "");
                }}
                initValue={rutaSelected.label}
                scrollViewAccessibilityLabel={"Scrollable options"}
                cancelText={"Cancelar"}
                optionTextStyle={{ color: "black" }}
                optionContainerStyle={{
                  backgroundColor: "white",
                  opacity: 1,
                  height: height * 0.5,
                }}
              >
                <Text
                  style={[
                    styles.textSelect,
                    styles.texColorWite,
                    styles.textInput,
                  ]}
                >
                  {rutaSelected.label}
                </Text>
              </ModalSelector>
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Selecciona un vehículo ({listBuses.length} disponibles)
              </Text>

              <ModalSelector
                data={listBuses}
                onChange={(option: any) => {
                  console.log("✅ Vehículo seleccionado:", option);
                  setBusSelected({
                    key: option.key || "",
                    label: option.label || "",
                    capacity: option.capacity,
                  });
                  setVehiculo(option.key || "");
                }}
                initValue={busSelected.label}
                scrollViewAccessibilityLabel={"Scrollable options"}
                cancelText={"Cancelar"}
                optionTextStyle={{ color: "black" }}
                optionContainerStyle={{
                  backgroundColor: "white",
                  opacity: 1,
                }}
              >
                <Text
                  style={[
                    styles.textSelect,
                    styles.texColorWite,
                    styles.textInput,
                  ]}
                >
                  {busSelected.label}
                </Text>
              </ModalSelector>
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Selecciona un Conductor ({listConductores.length} disponibles)
              </Text>

              <ModalSelector
                data={listConductores}
                onChange={(option: any) => {
                  console.log("✅ Conductor seleccionado:", option);
                  setConductorSelected({
                    key: option.key || "",
                    label: option.label || "",
                  });
                  setConductor(option.key || "");
                }}
                initValue={conductorSelected.label}
                scrollViewAccessibilityLabel={"Scrollable options"}
                cancelText={"Cancelar"}
                optionTextStyle={{ color: "black" }}
                optionContainerStyle={{
                  backgroundColor: "white",
                  opacity: 1,
                }}
              >
                <Text
                  style={[
                    styles.textSelect,
                    styles.texColorWite,
                    styles.textInput,
                  ]}
                >
                  {conductorSelected.label}
                </Text>
              </ModalSelector>
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Asientos disponibles
              </Text>
              <TextInput
                style={[styles.texColorWite, styles.textInput]}
                keyboardType="numeric"
                placeholder={`${busSelected.capacity || 0}`}
                placeholderTextColor="gray"
                autoCapitalize="none"
                onChangeText={(text) => setDisponibles(text)}
                value={disponibles}
              />
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Precio Comercial
              </Text>
              <TextInput
                style={[styles.texColorWite, styles.textInput]}
                keyboardType="numeric"
                placeholder="150000"
                placeholderTextColor="gray"
                autoCapitalize="none"
                onChangeText={(text) => setPrecio(text)}
                value={precio}
              />
            </View>

            <View style={[styles.containerSwitch]}>
              <View style={{}}>
                <Text
                  style={[
                    styles.textLabel,
                    styles.texColorWite,
                    styles.textSwitch,
                  ]}
                >
                  Aplicar Descuento
                </Text>
              </View>

              <Switch
                style={[styles.switch]}
                trackColor={{ false: "#767577", true: "#E2770f" }}
                thumbColor={dcto ? "#f4f3f4" : "#f4f3f4"}
                onValueChange={() => {
                  setDcto(!dcto);
                }}
                value={dcto}
              />
            </View>

            {dcto && (
              <View>
                <Text
                  style={[
                    styles.textLabel,
                    styles.texColorWite,
                    !dcto && styles.disable,
                  ]}
                >
                  Precio Descuento
                </Text>
                <TextInput
                  style={[
                    styles.texColorWite,
                    styles.textInput,
                    !dcto && styles.disable,
                  ]}
                  editable={dcto}
                  keyboardType="numeric"
                  placeholder="10000"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  onChangeText={(text) => setPrecioDcto(text)}
                  value={precioDcto}
                />
              </View>
            )}

            <View style={[styles.containerSwitch]}>
              <Text
                style={[
                  styles.textLabel,
                  styles.texColorWite,
                  styles.textSwitch,
                ]}
              >
                Se requiere documentación
              </Text>
              <Switch
                style={[styles.switch]}
                trackColor={{ false: "#767577", true: "#E2770f" }}
                thumbColor={documentacion ? "#f4f3f4" : "#f4f3f4"}
                onValueChange={() => {
                  setDocumentacion(!documentacion);
                }}
                value={documentacion}
              />
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Descripción
              </Text>
              <TextInput
                style={[styles.texColorWite, styles.textInput]}
                multiline
                numberOfLines={5}
                placeholder="Describe tu paquete turístico"
                placeholderTextColor="gray"
                autoCapitalize="none"
                onChangeText={(text) => setDescripcion(text)}
                value={descripcion}
              />
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Puntos de recogida
              </Text>
              <Text
                style={[styles.texColorWite, styles.textInput]}
                onPress={() => setModalRecogida(true)}
              >
                Añadir puntos de recogida
              </Text>

              <View>
                {places.map((punto, i) => {
                  return (
                    <Text
                      key={i}
                      style={[styles.textLabel, styles.texColorOrange]}
                    >
                      {punto.name}
                    </Text>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Punto de llegada
              </Text>
              <Text
                style={[styles.texColorWite, styles.textInput]}
                onPress={() => setModalPuntoFnal(true)}
              >
                Añadir punto de llegada
              </Text>
              {place.name && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorOrange]}>
                    {place?.name}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.textLabel, styles.texColorWite]}>
              Escoge las fechas de salida y regreso
            </Text>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                style={{ ...styles.input, width: "37%" }}
                onPress={() => setStatusCalendar(true)}
              >
                <View style={styles.textWithIcon}>
                  <Icon
                    name="calendar"
                    size={21}
                    color="orange"
                    type="material-community"
                  />
                  <Text style={styles.inputTextFiltros}>
                    {startDate}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{ paddingTop: 10, marginTop: 10 }}>
                <Icon
                  name="arrows-v"
                  size={10}
                  color="gray"
                  type="font-awesome"
                />
              </View>
              <TouchableOpacity
                style={{ ...styles.input, width: "37%" }}
                onPress={() => setStatusCalendar(true)}
              >
                <View style={styles.textWithIcon}>
                  <Icon
                    name="calendar"
                    size={21}
                    color="orange"
                    type="material-community"
                  />
                  <Text style={styles.inputTextFiltros}>
                    {endDate}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {statusCalendar && (
              <Overlay
                isVisible={statusCalendar}
                windowBackgroundColor="rgba(41, 41, 41, .7)"
                width={width * 0.9}
                height={440}
              >
                <Calendar
                  minDate={new Date().toISOString()}
                  monthFormat={"MMMM yyyy"}
                  markedDates={markedDates}
                  markingType="period"
                  hideExtraDays={true}
                  hideDayNames={true}
                  onDayPress={onDayPress}
                  style={{
                    marginBottom: 30,
                    height: 330,
                  }}
                />
                <View
                  style={{
                    ...styles.inputContainer,
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      ...styles.Botton,
                      backgroundColor: "#000",
                      width: "47%",
                    }}
                    onPress={() => {
                      setStatusCalendar(false);
                      setStartDate(moment(new Date()).format("YYYY-MM-DD"));
                      setEndDate(moment(new Date()).format("YYYY-MM-DD"));
                    }}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ ...styles.button, width: "47%" }}
                    onPress={() => {
                      setStatusCalendar(false);
                    }}
                  >
                    <Text style={styles.buttonText}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              </Overlay>
            )}

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                paddingTop:
                  Platform.OS === "ios" ? height * 0.01 : height * 0.015,
              }}
            >
              <TouchableOpacity
                style={{
                  ...styles.Botton,
                  backgroundColor: "#4f4f4f",
                  width: "100%",
                }}
                onPress={() => {
                  setDatePickerVisibility(true);
                }}
              >
                <Text
                  style={{
                    ...styles.texColorWite,
                    ...styles.textInput,
                    backgroundColor: "rgba(41, 41, 41, .7)",
                    width: width * 0.8,
                  }}
                >
                  Hora de salida: {horaSalida || "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                paddingTop:
                  Platform.OS === "ios" ? height * 0.01 : height * 0.015,
              }}
            >
              <TouchableOpacity
                style={{
                  ...styles.Botton,
                  backgroundColor: "#4f4f4f",
                  width: "100%",
                }}
                onPress={() => {
                  setDatePickerVisibleLlegada(true);
                }}
              >
                <Text
                  style={{
                    ...styles.texColorWite,
                    ...styles.textInput,
                    backgroundColor: "rgba(41, 41, 41, .7)",
                    width: width * 0.8,
                  }}
                >
                  Hora de llegada: {horaLlegada || "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingTop:
                  Platform.OS === "ios" ? height * 0.001 : height * 0.001,
                marginBottom:
                  Platform.OS === "ios" ? height * 0.001 : height * 0.001,
              }}
            >
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Imagen principal
              </Text>

              {imgPrincipal && (
                <Image
                  source={{ uri: imgPrincipal.file }}
                  style={{
                    height: 130,
                    width: 130,
                    alignSelf: "center",
                    borderRadius: 10,
                  }}
                />
              )}

              <TouchableOpacity
                style={{
                  ...styles.button,
                  marginTop: height * 0.01,
                  width: width * 0.7,
                  alignSelf: "center",
                }}
                onPress={() => {
                  console.log("se presiono el boton");
                  chooseImage("principal", 1)
                }}
              >
                <Text style={styles.text}>
                  {imgPrincipal ? "Cambiar" : "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingTop:
                  Platform.OS === "ios" ? height * 0.001 : height * 0.001,
                marginBottom:
                  Platform.OS === "ios" ? height * 0.001 : height * 0.001,
              }}
            >
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Imagen del banner
              </Text>

              {imgBanner && (
                <Image
                  source={{ uri: imgBanner.file }}
                  style={{
                    height: 130,
                    width: 130,
                    alignSelf: "center",
                    borderRadius: 10,
                  }}
                />
              )}

              <TouchableOpacity
                style={{
                  ...styles.button,
                  marginTop: height * 0.01,
                  width: width * 0.7,
                  alignSelf: "center",
                }}
                onPress={() => chooseImage("banner", 1)}
              >
                <Text style={styles.text}>
                  {imgBanner ? "Cambiar" : "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingTop: height * 0.01,
                alignSelf: "center",
              }}
            >
              <TouchableOpacity
                style={{ ...styles.button }}
                onPress={onHandleSubmit}
              >
                <Text style={styles.text}>Crear</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </KeyboardAwareScrollView>

      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalRecogida || modalPuntoFnal}
          onRequestClose={() => {
            setModalRecogida(false);
            setModalPuntoFnal(false);
          }}
        >
          <View style={styles.centeredView}>
            <TouchableOpacity
              onPress={() => {
                setModalRecogida(false);
                setModalPuntoFnal(false);
              }}
              style={styles.BottonClose}
            >
              <Text style={[styles.text, styles.textClose]}>X</Text>
            </TouchableOpacity>

            <View style={styles.modal}>
              {modalRecogida && (
                <GooglePlacesComponent
                  savePlaces={(places) => {
                    console.log("📥 Recibiendo puntos de recogida:", places);
                    savePlaces(places);
                  }}
                  cantElements={3}
                  closeModal={closeModal}
                />
              )}
              {modalPuntoFnal && (
                <GooglePlacesComponent
                  savePlaces={(place) => {
                    console.log("📥 Recibiendo punto final:", place);
                    savePlacesFinal(place);
                  }}
                  cantElements={1}
                  closeModal={closeModal}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>

      <DateTimePickerModal
        isVisible={DatePickerVisibility}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
      
      <DateTimePickerModal
        isVisible={DatePickerVisibleLlegada}
        mode="time"
        onConfirm={handleConfirmLlegada}
        onCancel={() => setDatePickerVisibleLlegada(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginBottom: 100,
    backgroundColor: "#4f4f4f",
  },
  textLabel: {
    fontSize: Platform.OS === "ios" ? width * 0.010 : width * 0.030,
    marginTop: Platform.OS === "ios" ? height * 0.01 : height * 0.02,
    marginBottom: Platform.OS === "ios" ? height * 0.01 : height * 0.01,
    textAlign: "center",
  },
  textSelect: {
    fontSize: Platform.OS === "ios" ? height * 0.015 : height * 0.013,
    marginVertical: 7,
    paddingVertical: 7,
    textAlign: "center",
    borderColor: "white",
    lineHeight: Platform.OS === "ios" ? height * 0.02 : height * 0.05,
    borderWidth: width * 0.002,
    borderRadius: Platform.OS === "ios" ? height * 0.02 : height * 0.035,
  },
  containerHeader: {
    flexDirection: "row",
    backgroundColor: "black",
    justifyContent: "space-between",
    borderBottomWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    height: Platform.OS === "ios" ? height * 0.09 : height * 0.08,
  },
  header: {
    height: height * 0.08,
    width: width * 1,
    alignItems: "center",
  },
  icon: {
    borderRadius: 100,
    backgroundColor: "transparent",
    position: "absolute",
    top: height * -0.05,
    left: -width * 0.17,
    alignItems: "flex-start",
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    marginVertical: 0,
  },
  textInput: {
    fontSize: Platform.OS === "ios" ? height * 0.023 : height * 0.02,
    marginVertical: 7,
    paddingVertical: 7,
    textAlign: "center",
    borderColor: "white",
    lineHeight: Platform.OS === "ios" ? height * 0.02 : height * 0.05,
    borderWidth: width * 0.005,
    borderRadius: height * 0.02,
  },
  containerSwitch: {
    flexDirection: "row",
  },
  textSwitch: {
    width: width * 0.4,
  },
  switch: {
    width: width * 0.42,
    borderWidth: width * 0.001,
    borderRadius: width * 0.03,
  },
  disable: {
    borderColor: "red",
    color: "red",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 15,
  },
  modalBtn: {
    backgroundColor: "#E2991C",
    borderRadius: 100,
    borderColor: "#FFF",
    width: width * 0.15,
    height: width * 0.15,
    alignContent: "center",
  },
  modal: {
    backgroundColor: "#4f4f4f",
    borderRadius: width * 0.05,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: height * 0.1,
    elevation: 5,
    padding: width * 0.05,
    width: width * 0.87,
    height: height * 0.43,
    alignContent: "center",
  },
  colorW: {
    color: "#fff",
  },
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  BottonClose: {
    position: "absolute",
    backgroundColor: "#868686",
    borderRadius: 100,
    top: height * 0.23,
    right: height * 0.22,
    width: width * 0.09,
    height: width * 0.09,
    alignContent: "center",
  },
  textClose: {
    fontWeight: "bold",
    fontSize: height * 0.028,
    textAlign: "center",
    lineHeight: width * 0.1,
    color: "white",
  },
  texColorWite: {
    color: "white",
  },
  texColorOrange: {
    color: "orange",
  },
  titleText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
  },
  textStyle: {
    padding: 10,
    color: "black",
    textAlign: "center",
  },
  buttonStyle: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 5,
    marginVertical: 10,
    width: 250,
  },
  button: {
    backgroundColor: "orange",
    borderRadius: 20,
    width: width * 0.5,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 15,
    width: width * 0.35,
    height: width * 0.123,
  },
  textWithIcon: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    fontSize: 18,
    height: width * 0.05,
  },
  Botton: {
    backgroundColor: "orange",
    borderRadius: 20,
    width: 325,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: Platform.OS === "ios" ? width * 0.042 : width * 0.05,
    color: "#FFF",
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
  },
  inputTextFiltros: {
    color: "black",
  },
});

export default CreateProgramming;