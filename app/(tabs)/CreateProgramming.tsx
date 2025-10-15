import { KeyboardAwareScrollView } from "@codler/react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, useRouter } from 'expo-router';
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Header, Icon, Overlay } from "react-native-elements";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ModalSelector from "react-native-modal-selector";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import { GooglePlacesComponent } from "../../components/GooglePlacesComponent";
import { RootState } from '../../redux/store';
import CreateProgrammingServices from "../../services/createProgrammingServices";
import { helpers } from "../../utils/helpers";

interface Route {
  id: string;
  key?: string;
  label?: string;
  origin: { id: string; name: string };
  destination: { id: string; name: string };
}

interface Bus {
  id: string;
  key?: string;
  label?: string;
  name: string;
  images: Array<{ id: string; url: string }>;
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

const { height, width } = Dimensions.get("window");

const CreateProgramming: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const userIdFromParams = params.userId as string;
  const userNameFromParams = params.userName as string;
  
  const idState = useSelector((state: RootState) => state.id);
  const sessionState = useSelector((state: RootState) => state.session);

  const getUser = () => {
    if (userIdFromParams) {
      return { _id: userIdFromParams, names: userNameFromParams };
    }
    if (idState && typeof idState === 'string' && idState.length > 0) {
      return { _id: idState, id: idState };
    }
    if (sessionState?.user?.idUser) {
      return { _id: sessionState.user.idUser, names: sessionState.user.nombres };
    }
    return null;
  };
  
  const user = getUser();
  const userId = user?._id || user?.id;

  const [modalRecogida, setModalRecogida] = useState(false);
  const [modalPuntoFnal, setModalPuntoFnal] = useState(false);
  const [listBuses, setListBuses] = useState<Bus[]>([]);
  const [listRutas, setListRutas] = useState<Route[]>([]);
  const [listConductores, setListConductores] = useState<Driver[]>([]);

  const [rutaSelected, setRutaSelected] = useState({ key: "-1", label: "Debes seleccionar una ruta" });
  const [busSelected, setBusSelected] = useState({ key: "-1", label: "Debes seleccionar un bus", capacity: 0 });
  const [conductorSelected, setConductorSelected] = useState({ key: "-1", label: "Debes seleccionar un Conductor" });

  const [startDate, setStartDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [DatePickerVisibility, setDatePickerVisibility] = useState(false);
  const [DatePickerVisibleLlegada, setDatePickerVisibleLlegada] = useState(false);
  const [statusCalendar, setStatusCalendar] = useState(false);
  const [isStartDatePicked, setIsStartDatePicked] = useState(false);
  const [isEndDatePicked, setIsEndDatePicked] = useState(false);

  const [ruta, setRuta] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [conductor, setConductor] = useState("");
  const [disponibles, setDisponibles] = useState("");
  const [precio, setPrecio] = useState("");
  const [dcto, setDcto] = useState(false);
  const [documentacion, setDocumentacion] = useState(false);
  const [precioDcto, setPrecioDcto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place>({});
  const [imgPrincipal, setImgPrincipal] = useState<ImageOption | null>(null);
  const [imgBanner, setImgBanner] = useState<ImageOption | null>(null);
  const [imgGallery, setImgGallery] = useState<ImageOption[]>([]);

  const getData = () => {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario", [{ text: "OK", onPress: () => router.back() }]);
      return;
    }
    getRoutes(userId);
  };

  const getRoutes = (userIdParam: string) => {
    CreateProgrammingServices.getRoutesEnabled()
      .then((result: Route[]) => {
        const formattedRoutes = result.map(route => ({
          ...route,
          key: route.id,
          label: `${route.origin.name}-${route.destination.name}`,
        }));
        setListRutas(formattedRoutes);
        getBuses(userIdParam);
      })
      .catch(() => getBuses(userIdParam));
  };

  const getBuses = (userIdParam: string) => {
    CreateProgrammingServices.getBusesEnable(userIdParam)
      .then((res: Bus[]) => {
        const formattedBuses = res.map(bus => ({ ...bus, key: bus.id, label: bus.name }));
        setListBuses(formattedBuses);
        getDrivers(userIdParam);
      })
      .catch(() => getDrivers(userIdParam));
  };

  const getDrivers = (userIdParam: string) => {
    CreateProgrammingServices.getDriversEnable(userIdParam)
      .then((res: Driver[]) => {
        const formattedDrivers = res.map(driver => ({ ...driver, key: driver.id, label: driver.names }));
        setListConductores(formattedDrivers);
      })
      .catch((error) => console.error("Error obteniendo conductores:", error));
  };

  const onDayPress = (day: { dateString: string }) => {
    if (!isStartDatePicked || moment(day.dateString) < moment(startDate)) {
      setMarkedDates({ [day.dateString]: { startingDay: true, color: "orange", textColor: "#FFFFFF" } });
      setIsStartDatePicked(true);
      setIsEndDatePicked(false);
      setStartDate(day.dateString);
      setEndDate(day.dateString);
    } else {
      const newMarkedDates = { ...markedDates };
      const startDateMoment = moment(startDate);
      const range = moment(day.dateString).diff(startDateMoment, "days");
      
      setEndDate(day.dateString);
      if (range > 0) {
        let tempDate = startDateMoment;
        for (let i = 1; i <= range; i++) {
          tempDate = tempDate.add(1, "day");
          const tempDateStr = moment(tempDate).format("YYYY-MM-DD");
          newMarkedDates[tempDateStr] = i < range 
            ? { color: "orange", textColor: "#FFFFFF" }
            : { endingDay: true, color: "orange", textColor: "#FFFFFF" };
        }
        setMarkedDates(newMarkedDates);
        setIsStartDatePicked(false);
        setIsEndDatePicked(true);
      }
    }
  };

  const savePlaces = (newPlaces: Place[] | undefined) => {
    const placesToSave = Array.isArray(newPlaces) ? newPlaces.filter(item => item) : [];
    setPlaces(placesToSave);
  };
    
  const savePlacesFinal = (newPlace: Place[] | undefined) => {
    if (Array.isArray(newPlace) && newPlace.length > 0) {
      setPlace(newPlace[0]);
    } else {
      setPlace({});
    }
  };

  const closeModal = () => {
    setModalRecogida(false);
    setModalPuntoFnal(false);
  };

  const chooseImage = async (type: string, limit: number) => {
    try {
      const resp = await helpers.pickImages(limit, [4, 3]);
      const options: ImageOption = {
        name: type,
        file: resp.uri[0],
        fileF: resp.file,
        base64: resp.base64,
      };
      if (type === "principal") setImgPrincipal(options);
      else if (type === "banner") setImgBanner(options);
      else if (type === "gallery") {
        let gallery = [...imgGallery];
        if (gallery.length > 5) gallery.shift();
        setImgGallery([...gallery, options]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const sendUpload = async (id: string): Promise<boolean> => {
    try {
      if (imgPrincipal) {
        await helpers.uploadImages(imgPrincipal, id, "destino", place.name || "programacion", "principal");
      }
      if (imgBanner) {
        await helpers.uploadImages(imgBanner, id, "destino", place.name || "programacion", "banner");
      }
      for (let i = 0; i < imgGallery.length; i++) {
        await helpers.uploadImages(imgGallery[i], id, "destino", place.name || "programacion", "gallery");
      }
      return true;
    } catch (error) {
      throw error;
    }
  };

  const onHandleSubmit = () => {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }
    
    const errors: string[] = [];
    if (!ruta) errors.push("* Debe seleccionar una ruta.");
    if (!vehiculo) errors.push("* Debe seleccionar un vehículo.");
    if (!conductor) errors.push("* Debe seleccionar un conductor.");
    if (!disponibles || Number(disponibles) <= 0 || Number(disponibles) > (busSelected.capacity || 0)) 
      errors.push("* Debe poner el número de asientos válido.");
    if (dcto && (!precioDcto || Number(precioDcto) <= 0)) 
      errors.push("* Debe poner el precio del descuento.");
    if (!precio || Number(precio) <= 0) errors.push("* Debe poner el precio comercial.");
    if (!descripcion.trim()) errors.push("* Debe poner la descripción del paquete.");
    if (places.length === 0) errors.push("* Debe seleccionar los puntos de recogida.");
    if (!place.name) errors.push("* Debe poner el punto de llegada.");
    if (!startDate || !horaSalida) errors.push("* Debe seleccionar una fecha y hora de salida.");
    if (!endDate || !horaLlegada) errors.push("* Debe seleccionar una fecha y hora de llegada.");

    if (errors.length > 0) {
      Alert.alert("Alerta", errors.join("\n"));
      return;
    }

    Alert.alert("Confirmar", "¿Estás seguro de que quieres crear esta programación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Crear",
        onPress: () => {
          if (!userId) return;
          
          sendUpload(userId)
            .then(() => {
              const obj = {
                id: userId,
                ruta,
                vehiculo,
                conductor,
                disponibles,
                precio,
                dcto,
                precioDcto: dcto ? precioDcto : "",
                documentacion,
                places,
                place,
                descripcion,
                images: imgPrincipal?.file || "",
                banner: imgBanner?.file || "",
                start: `${startDate}T${horaSalida}:00.000+00:00`,
                end: `${endDate}T${horaLlegada}:00.000+00:00`,
              };
              
              CreateProgrammingServices.createProgramming(obj)
                .then(() => {
                  Alert.alert("Éxito", "Programación creada correctamente");
                  router.back();
                })
                .catch(() => Alert.alert("Error", "No se pudo crear la programación"));
            })
            .catch(() => Alert.alert("Error", "Error al subir las imágenes"));
        }
      }
    ]);
  };

  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    setHoraSalida(`${hour}:${minutes}`);
  };

  const handleConfirmLlegada = (date: Date) => {
    setDatePickerVisibleLlegada(false);
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    setHoraLlegada(`${hour}:${minutes}`);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={{ backgroundColor: "#4f4f4f", flex: 1 }}>
      <StatusBar barStyle={"light-content"} />
      <Header containerStyle={styles.containerHeader}>
        <View style={styles.header}>
          <Text style={[styles.colorW, { fontSize: height * 0.03 }]}>Crear programación</Text>
        </View>
        <View style={styles.icon}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={width * 0.1} color="#fff" />
          </TouchableOpacity>
        </View>
      </Header>

      <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View>
            <Text style={[styles.textLabel, styles.texColorWite]}>Selecciona una ruta</Text>
            {listRutas?.length ? (
              <ModalSelector data={listRutas} onChange={(opt: any) => { setRutaSelected(opt); setRuta(opt.key); }} initValue={rutaSelected.label} cancelText="Cancelar" optionTextStyle={{ color: "black" }} optionContainerStyle={{ backgroundColor: "white", height: height * 0.5 }}>
                <Text style={[styles.textSelect, styles.texColorWite, styles.textInput]}>{rutaSelected.label}</Text>
              </ModalSelector>
            ) : <Text style={[styles.textSelect, styles.texColorWite, styles.textInput, { color: 'gray' }]}>Cargando rutas...</Text>}
          </View>

          <View>
            <Text style={[styles.textLabel, styles.texColorWite]}>Selecciona un vehículo ({listBuses?.length || 0})</Text>
            {listBuses?.length ? (
              <ModalSelector data={listBuses} onChange={(opt: any) => { setBusSelected({ key: opt.key, label: opt.label, capacity: opt.capacity }); setVehiculo(opt.key); }} initValue={busSelected.label} cancelText="Cancelar" optionTextStyle={{ color: "black" }} optionContainerStyle={{ backgroundColor: "white" }}>
                <Text style={[styles.textSelect, styles.texColorWite, styles.textInput]}>{busSelected.label}</Text>
              </ModalSelector>
            ) : <Text style={[styles.textSelect, styles.texColorWite, styles.textInput, { color: 'gray' }]}>Cargando vehículos...</Text>}
          </View>

          <View>
            <Text style={[styles.textLabel, styles.texColorWite]}>Selecciona un Conductor ({listConductores?.length || 0})</Text>
            {listConductores?.length ? (
              <ModalSelector data={listConductores} onChange={(opt: any) => { setConductorSelected({ key: opt.key, label: opt.label }); setConductor(opt.key); }} initValue={conductorSelected.label} cancelText="Cancelar" optionTextStyle={{ color: "black" }} optionContainerStyle={{ backgroundColor: "white" }}>
                <Text style={[styles.textSelect, styles.texColorWite, styles.textInput]}>{conductorSelected.label}</Text>
              </ModalSelector>
            ) : <Text style={[styles.textSelect, styles.texColorWite, styles.textInput, { color: 'gray' }]}>Cargando conductores...</Text>}
          </View>

          <View><Text style={[styles.textLabel, styles.texColorWite]}>Asientos disponibles</Text><TextInput style={[styles.texColorWite, styles.textInput]} keyboardType="numeric" placeholder={`${busSelected.capacity || 0}`} placeholderTextColor="gray" onChangeText={setDisponibles} value={disponibles} /></View>
          <View><Text style={[styles.textLabel, styles.texColorWite]}>Precio Comercial</Text><TextInput style={[styles.texColorWite, styles.textInput]} keyboardType="numeric" placeholder="150000" placeholderTextColor="gray" onChangeText={setPrecio} value={precio} /></View>

          <View style={styles.containerSwitch}><Text style={[styles.textLabel, styles.texColorWite, styles.textSwitch]}>Aplicar Descuento</Text><Switch trackColor={{ false: "#767577", true: "#E2770f" }} thumbColor="#f4f3f4" onValueChange={() => setDcto(!dcto)} value={dcto} /></View>
          {dcto && <View><Text style={[styles.textLabel, styles.texColorWite]}>Precio Descuento</Text><TextInput style={[styles.texColorWite, styles.textInput]} keyboardType="numeric" placeholder="10000" placeholderTextColor="gray" onChangeText={setPrecioDcto} value={precioDcto} /></View>}

          <View style={styles.containerSwitch}><Text style={[styles.textLabel, styles.texColorWite, styles.textSwitch]}>Se requiere documentación</Text><Switch trackColor={{ false: "#767577", true: "#E2770f" }} thumbColor="#f4f3f4" onValueChange={() => setDocumentacion(!documentacion)} value={documentacion} /></View>
          <View><Text style={[styles.textLabel, styles.texColorWite]}>Descripción</Text><TextInput style={[styles.texColorWite, styles.textArea]} multiline numberOfLines={4} placeholder="Describe tu paquete turístico" placeholderTextColor="gray" onChangeText={setDescripcion} value={descripcion} /></View>

          <View><Text style={[styles.textLabel, styles.texColorWite]}>Puntos de recogida</Text><Text style={[styles.texColorWite, styles.textInput]} onPress={() => setModalRecogida(true)}>Añadir puntos de recogida</Text>{places.map((p, i) => <Text key={i} style={[styles.textLabel, styles.texColorOrange]}>{p.name}</Text>)}</View>
          <View><Text style={[styles.textLabel, styles.texColorWite]}>Punto de llegada</Text><Text style={[styles.texColorWite, styles.textInput]} onPress={() => setModalPuntoFnal(true)}>Añadir punto de llegada</Text>{place.name && <Text style={[styles.textLabel, styles.texColorOrange]}>{place.name}</Text>}</View>

          <Text style={[styles.textLabel, styles.texColorWite]}>Escoge las fechas</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 15 }}>
            <TouchableOpacity style={{ ...styles.input, width: "37%" }} onPress={() => setStatusCalendar(true)}>
              <View style={styles.textWithIcon}><Icon name="calendar" size={21} color="orange" type="material-community" /><Text style={styles.inputTextFiltros}>{startDate}</Text></View>
            </TouchableOpacity>
            <View style={{ paddingTop: 10 }}><Icon name="arrows-v" size={10} color="gray" type="font-awesome" /></View>
            <TouchableOpacity style={{ ...styles.input, width: "37%" }} onPress={() => setStatusCalendar(true)}>
              <View style={styles.textWithIcon}><Icon name="calendar" size={21} color="orange" type="material-community" /><Text style={styles.inputTextFiltros}>{endDate}</Text></View>
            </TouchableOpacity>
          </View>

          {statusCalendar && (
            <Overlay isVisible windowBackgroundColor="rgba(41, 41, 41, .7)" width={width * 0.9} height={440}>
              <Calendar minDate={new Date().toISOString()} monthFormat="MMMM yyyy" markedDates={markedDates} markingType="period" hideExtraDays hideDayNames onDayPress={onDayPress} style={{ marginBottom: 30, height: 330 }} />
              <View style={{ ...styles.inputContainer, justifyContent: "space-between" }}>
                <TouchableOpacity style={{ ...styles.Botton, backgroundColor: "#000", width: "47%" }} onPress={() => { setStatusCalendar(false); setStartDate(moment(new Date()).format("YYYY-MM-DD")); setEndDate(moment(new Date()).format("YYYY-MM-DD")); }}><Text style={styles.buttonText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={{ ...styles.button, width: "47%" }} onPress={() => setStatusCalendar(false)}><Text style={styles.buttonText}>Aceptar</Text></TouchableOpacity>
              </View>
            </Overlay>
          )}

          <TouchableOpacity style={{ ...styles.Botton, backgroundColor: "#4f4f4f", width: "100%", marginBottom: 15 }} onPress={() => setDatePickerVisibility(true)}>
            <Text style={{ ...styles.texColorWite, ...styles.textInput, backgroundColor: "rgba(41, 41, 41, .7)", width: width * 0.8 }}>Hora de salida: {horaSalida || "Seleccionar"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.Botton, backgroundColor: "#4f4f4f", width: "100%", marginBottom: 15 }} onPress={() => setDatePickerVisibleLlegada(true)}>
            <Text style={{ ...styles.texColorWite, ...styles.textInput, backgroundColor: "rgba(41, 41, 41, .7)", width: width * 0.8 }}>Hora de llegada: {horaLlegada || "Seleccionar"}</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 20 }}><Text style={[styles.textLabel, styles.texColorWite]}>Imagen principal</Text>{imgPrincipal && <Image source={{ uri: imgPrincipal.file }} style={{ height: 130, width: 130, alignSelf: "center", borderRadius: 10, marginBottom: 10 }} />}<TouchableOpacity style={{ ...styles.button, width: width * 0.7, alignSelf: "center" }} onPress={() => chooseImage("principal", 1)}><Text style={styles.text}>{imgPrincipal ? "Cambiar" : "Seleccionar"}</Text></TouchableOpacity></View>

          <View style={{ marginBottom: 20 }}><Text style={[styles.textLabel, styles.texColorWite]}>Imagen del banner</Text>{imgBanner && <Image source={{ uri: imgBanner.file }} style={{ height: 130, width: 130, alignSelf: "center", borderRadius: 10, marginBottom: 10 }} />}<TouchableOpacity style={{ ...styles.button, width: width * 0.7, alignSelf: "center" }} onPress={() => chooseImage("banner", 1)}><Text style={styles.text}>{imgBanner ? "Cambiar" : "Seleccionar"}</Text></TouchableOpacity></View>

          <TouchableOpacity style={{ ...styles.button, alignSelf: "center", marginBottom: 50 }} onPress={onHandleSubmit}><Text style={styles.text}>Crear</Text></TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalRecogida || modalPuntoFnal}
        onRequestClose={() => {
          console.log("🔴 Modal cerrado por onRequestClose");
          setModalRecogida(false);
          setModalPuntoFnal(false);
        }}
      >
        <View style={styles.centeredView}>
          <TouchableOpacity
            onPress={() => {
              console.log("🔴 Cerrando modal por touchable");
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
                  console.log("📥 Recibiendo puntos de recogida desde modal:", places);
                  // ✅ PROTECCIÓN EXTRA - asegurar que es array
                  const validPlaces = Array.isArray(places) ? places : [];
                  console.log("📍 Lugares válidos después de protección:", validPlaces);
                  savePlaces(validPlaces);
                }}
                cantElements={3}
                closeModal={closeModal}
              />
            )}
            {modalPuntoFnal && (
              <GooglePlacesComponent
                savePlaces={(place) => {
                  console.log("📥 Recibiendo punto final desde modal:", place);
                  // ✅ PROTECCIÓN EXTRA - asegurar que es array
                  const validPlace = Array.isArray(place) ? place : [];
                  console.log("📍 Lugar final válido después de protección:", validPlace);
                  savePlacesFinal(validPlace);
                }}
                cantElements={1}
                closeModal={closeModal}
              />
            )}
          </View>
        </View>
      </Modal>

      <DateTimePickerModal isVisible={DatePickerVisibility} mode="time" onConfirm={handleConfirm} onCancel={() => setDatePickerVisibility(false)} />
      <DateTimePickerModal isVisible={DatePickerVisibleLlegada} mode="time" onConfirm={handleConfirmLlegada} onCancel={() => setDatePickerVisibleLlegada(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, marginBottom: 100, backgroundColor: "#4f4f4f" },
  textLabel: { fontSize: Platform.OS === "ios" ? width * 0.010 : width * 0.030, marginTop: height * 0.02, marginBottom: height * 0.01, textAlign: "center" },
  textSelect: { fontSize: height * 0.013, marginVertical: 7, paddingVertical: 7, textAlign: "center", borderColor: "white", borderWidth: width * 0.002, borderRadius: height * 0.02 },
  containerHeader: { flexDirection: "row", backgroundColor: "black", justifyContent: "center", alignItems: "center", height: height * 0.08 },
  header: { height: height * 0.08, width: width, alignItems: "center" },
  icon: { position: "absolute", left: -width * 0.17, zIndex: 1 },
  inputContainer: { flexDirection: "row", marginVertical: 0 },
  textInput: { fontSize: height * 0.02, marginVertical: 7, paddingVertical: 7, textAlign: "center", borderColor: "white", borderWidth: width * 0.005, borderRadius: height * 0.02 },
  textArea: { fontSize: height * 0.02, marginVertical: 7, paddingVertical: 7, textAlign: "center", borderColor: "white", borderWidth: width * 0.005, borderRadius: height * 0.02, color: "white", minHeight: 100 },
  containerSwitch: { flexDirection: "row", marginVertical: 10 },
  textSwitch: { width: width * 0.4 },
  switch: { width: width * 0.42 },
  buttonText: { color: "#FFF", fontSize: 15 },
  modal: { backgroundColor: "#4f4f4f", borderRadius: width * 0.05, padding: width * 0.05, width: width * 0.87, height: height * 0.43, elevation: 5 },
  colorW: { color: "#fff" },
  centeredView: { flex: 1, backgroundColor: "rgba(0,0,0, 0.7)", justifyContent: "center", alignItems: "center" },
  BottonClose: { position: "absolute", backgroundColor: "#868686", borderRadius: 100, top: height * 0.23, right: height * 0.22, width: width * 0.09, height: width * 0.09, justifyContent: "center", alignItems: "center", zIndex: 10 },
  textClose: { fontWeight: "bold", fontSize: height * 0.028, color: "white" },
  texColorWite: { color: "white" },
  texColorOrange: { color: "orange" },
  button: { backgroundColor: "orange", borderRadius: 20, padding: 15, justifyContent: "center", alignItems: "center" },
  input: { backgroundColor: "white", borderRadius: 30, padding: 15, height: width * 0.123 },
  textWithIcon: { width: "100%", flexDirection: "row", alignItems: "center", height: width * 0.05 },
  Botton: { borderRadius: 20, padding: 15, justifyContent: "center", alignItems: "center" },
  text: { fontSize: Platform.OS === "ios" ? width * 0.042 : width * 0.05, color: "#FFF", textAlign: "center" },
  inputTextFiltros: { color: "black", marginLeft: 10 },
});

export default CreateProgramming;