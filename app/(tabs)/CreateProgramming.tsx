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
import { Icon, Overlay } from "react-native-elements";
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

  const [rutaSelected, setRutaSelected] = useState({ key: "-1", label: "Seleccionar ruta" });
  const [busSelected, setBusSelected] = useState({ key: "-1", label: "Seleccionar bus", capacity: 0 });
  const [conductorSelected, setConductorSelected] = useState({ key: "-1", label: "Seleccionar conductor" });

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
          label: `${route.origin.name} - ${route.destination.name}`,
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
      
      if (!resp || !resp.uri || !resp.uri[0]) {
        throw new Error("No se pudo obtener la imagen seleccionada");
      }

      const options: ImageOption = {
        name: type,
        file: resp.uri[0],
        fileF: resp.file,
        base64: resp.base64 || '',
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
          setImgGallery([...gallery, options]);
          break;
      }
      
    } catch (error: any) {
      console.error("❌ Error en chooseImage:", error);
      
      let errorMessage = "No se pudo seleccionar la imagen";
      
      if (error.message.includes('cancel')) {
        errorMessage = "Selección de imagen cancelada";
      } else if (error.message.includes('permisos')) {
        errorMessage = "Se necesitan permisos para acceder a la galería";
      } else if (error.message.includes('disponible')) {
        errorMessage = "El selector de imágenes no está disponible";
      } else if (error.message.includes('No se seleccionó')) {
        errorMessage = "No se seleccionó ninguna imagen";
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  const sendUpload = async (id: string): Promise<boolean> => {
    try {
      const uploadPromises = [];
      if (imgPrincipal) {
        uploadPromises.push(
          helpers.uploadImages({
            file: imgPrincipal, 
            id, 
            type: "destino", 
            nombrepaq: place.name || "programacion", 
            typeGalery: "principal"
          })
        );
      }

      if (imgBanner) {
        uploadPromises.push(
          helpers.uploadImages({
            file: imgBanner, 
            id, 
            type: "destino", 
            nombrepaq: place.name || "programacion", 
            typeGalery: "banner"
          })
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      } else {
        console.log("ℹ️ No hay imágenes para subir");
      }

      return true;
    } catch (error) {
      console.error("❌ Error en sendUpload:", error);
      throw error;
    }
  };

  const onHandleSubmit = async () => {
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
        onPress: async () => {
          try {
            if (!userId) return;
            
            // ✅ CORREGIDO: Subir imágenes primero
            await sendUpload(userId);
            
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
                      
            await CreateProgrammingServices.createProgramming(obj);
            Alert.alert("Éxito", "Programación creada correctamente");
            router.back();
            
          } catch (error) {
            console.error("❌ Error al crear programación:", error);
            Alert.alert("Error", "No se pudo crear la programación");
          }
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
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      
      {/* HEADER MEJORADO */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5
            name={'arrow-left'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Crear programación
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        contentContainerStyle={styles.scrollContent}
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}>
        
        <View style={styles.formContainer}>
          
          {/* SECCIÓN INFORMACIÓN BÁSICA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ruta</Text>
              {listRutas?.length ? (
                <ModalSelector 
                  data={listRutas} 
                  onChange={(opt: any) => { 
                    setRutaSelected(opt); 
                    setRuta(opt.key); 
                  }} 
                  initValue={rutaSelected.label} 
                  cancelText="Cancelar" 
                  optionTextStyle={{ color: "black" }} 
                  optionContainerStyle={{ backgroundColor: "white", maxHeight: height * 0.4 }}
                >
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={[
                      styles.selectText,
                      rutaSelected.key === "-1" && styles.placeholderText
                    ]}>
                      {rutaSelected.label}
                    </Text>
                    <Icon name="chevron-down" type="material-community" color="#999" size={20} />
                  </TouchableOpacity>
                </ModalSelector>
              ) : (
                <Text style={styles.loadingText}>Cargando rutas...</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehículo</Text>
              {listBuses?.length ? (
                <ModalSelector 
                  data={listBuses} 
                  onChange={(opt: any) => { 
                    setBusSelected({ key: opt.key, label: opt.label, capacity: opt.capacity }); 
                    setVehiculo(opt.key); 
                  }} 
                  initValue={busSelected.label} 
                  cancelText="Cancelar" 
                  optionTextStyle={{ color: "black" }} 
                  optionContainerStyle={{ backgroundColor: "white", maxHeight: height * 0.4 }}
                >
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={[
                      styles.selectText,
                      busSelected.key === "-1" && styles.placeholderText
                    ]}>
                      {busSelected.label}
                    </Text>
                    <Icon name="chevron-down" type="material-community" color="#999" size={20} />
                  </TouchableOpacity>
                </ModalSelector>
              ) : (
                <Text style={styles.loadingText}>Cargando vehículos...</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Conductor</Text>
              {listConductores?.length ? (
                <ModalSelector 
                  data={listConductores} 
                  onChange={(opt: any) => { 
                    setConductorSelected({ key: opt.key, label: opt.label }); 
                    setConductor(opt.key); 
                  }} 
                  initValue={conductorSelected.label} 
                  cancelText="Cancelar" 
                  optionTextStyle={{ color: "black" }} 
                  optionContainerStyle={{ backgroundColor: "white", maxHeight: height * 0.4 }}
                >
                  <TouchableOpacity style={styles.selectInput}>
                    <Text style={[
                      styles.selectText,
                      conductorSelected.key === "-1" && styles.placeholderText
                    ]}>
                      {conductorSelected.label}
                    </Text>
                    <Icon name="chevron-down" type="material-community" color="#999" size={20} />
                  </TouchableOpacity>
                </ModalSelector>
              ) : (
                <Text style={styles.loadingText}>Cargando conductores...</Text>
              )}
            </View>
          </View>

          {/* SECCIÓN CAPACIDAD Y PRECIOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Capacidad y precios</Text>
            
            <View style={styles.gridRow}>
              <View style={styles.gridInput}>
                <Text style={styles.inputLabel}>Asientos disponibles</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder={`Máx: ${busSelected.capacity || 0}`}
                  placeholderTextColor="#999"
                  onChangeText={setDisponibles}
                  value={disponibles}
                />
              </View>
              
              <View style={styles.gridInput}>
                <Text style={styles.inputLabel}>Precio comercial</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[styles.textInput, styles.priceTextInput]}
                    keyboardType="numeric"
                    placeholder="150000"
                    placeholderTextColor="#999"
                    onChangeText={setPrecio}
                    value={precio}
                  />
                </View>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Aplicar descuento</Text>
              <Switch
                trackColor={{false: '#767577', true: '#E2991C'}}
                thumbColor={dcto ? '#f4f3f4' : '#f4f3f4'}
                onValueChange={() => setDcto(!dcto)}
                value={dcto}
              />
            </View>

            {dcto && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Precio con descuento</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[styles.textInput, styles.priceTextInput]}
                    keyboardType="numeric"
                    placeholder="10000"
                    placeholderTextColor="#999"
                    onChangeText={setPrecioDcto}
                    value={precioDcto}
                  />
                </View>
              </View>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Requiere documentación</Text>
              <Switch
                trackColor={{false: '#767577', true: '#E2991C'}}
                thumbColor={documentacion ? '#f4f3f4' : '#f4f3f4'}
                onValueChange={() => setDocumentacion(!documentacion)}
                value={documentacion}
              />
            </View>
          </View>

          {/* SECCIÓN DESCRIPCIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción del viaje</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Describe los detalles del viaje..."
                placeholderTextColor="#999"
                onChangeText={setDescripcion}
                value={descripcion}
              />
            </View>
          </View>

          {/* SECCIÓN PUNTOS DE RECOGIDA Y LLEGADA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicaciones</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Puntos de recogida</Text>
              <TouchableOpacity 
                style={styles.buttonOutlined}
                onPress={() => setModalRecogida(true)}
              >
                <Text style={styles.buttonOutlinedText}>+ Añadir puntos de recogida</Text>
              </TouchableOpacity>
              
              {places.length > 0 && (
                <View style={styles.placesList}>
                  {places.map((punto, i) => (
                    <View key={i} style={styles.placeItem}>
                      <Text style={styles.placeText}>📍 {punto.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Punto de llegada</Text>
              <TouchableOpacity 
                style={styles.buttonOutlined}
                onPress={() => setModalPuntoFnal(true)}
              >
                <Text style={styles.buttonOutlinedText}>+ Añadir punto de llegada</Text>
              </TouchableOpacity>
              
              {place.name && (
                <View style={styles.placeItem}>
                  <Text style={styles.placeText}>📍 {place.name}</Text>
                </View>
              )}
            </View>
          </View>

          {/* SECCIÓN FECHAS Y HORAS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fechas y horarios</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha inicio</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setStatusCalendar(true)}
                >
                  <Text style={styles.dateButtonText}>{startDate}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha fin</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setStatusCalendar(true)}
                >
                  <Text style={styles.dateButtonText}>{endDate}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>Hora salida</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => setDatePickerVisibility(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {horaSalida || 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>Hora llegada</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => setDatePickerVisibleLlegada(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {horaLlegada || 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* SECCIÓN IMÁGENES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imágenes</Text>
            
            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Imagen principal</Text>
              <TouchableOpacity 
                style={styles.imageUpload}
                onPress={() => chooseImage("principal", 1)}
              >
                {imgPrincipal ? (
                  <Image
                    source={{ uri: imgPrincipal.file }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="camera" type="material-community" color="#999" size={30} />
                    <Text style={styles.imagePlaceholderText}>Seleccionar imagen</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Imagen banner</Text>
              <TouchableOpacity 
                style={styles.imageUpload}
                onPress={() => chooseImage("banner", 1)}
              >
                {imgBanner ? (
                  <Image
                    source={{ uri: imgBanner.file }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="image" type="material-community" color="#999" size={30} />
                    <Text style={styles.imagePlaceholderText}>Seleccionar banner</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

          </View>

          {/* BOTÓN CREAR */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={onHandleSubmit}
          >
            <Text style={styles.createButtonText}>Crear programación</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAwareScrollView>

      {/* MODALES */}
      <DateTimePickerModal
        isVisible={DatePickerVisibility}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        locale='es_CO'
      />
      
      <DateTimePickerModal
        isVisible={DatePickerVisibleLlegada}
        mode="time"
        onConfirm={handleConfirmLlegada}
        onCancel={() => setDatePickerVisibleLlegada(false)}
        locale='es_CO'
      />

      {statusCalendar && (
        <Overlay
          isVisible={statusCalendar}
          windowBackgroundColor="rgba(0, 0, 0, 0.7)"
          overlayStyle={styles.calendarOverlay}
        >
          <Calendar
            minDate={new Date().toISOString()}
            monthFormat="MMMM yyyy"
            markedDates={markedDates}
            markingType="period"
            hideExtraDays
            onDayPress={onDayPress}
            style={styles.calendar}
            theme={{
              calendarBackground: '#2d2d2d',
              textSectionTitleColor: '#fff',
              dayTextColor: '#fff',
              todayTextColor: '#E2991C',
              selectedDayTextColor: '#fff',
              monthTextColor: '#fff',
              arrowColor: '#E2991C',
            }}
          />
          <View style={styles.calendarButtons}>
            <TouchableOpacity 
              style={[styles.calendarButton, styles.cancelButton]}
              onPress={() => setStatusCalendar(false)}
            >
              <Text style={styles.calendarButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.calendarButton, styles.confirmButton]}
              onPress={() => setStatusCalendar(false)}
            >
              <Text style={styles.calendarButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </Overlay>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalRecogida || modalPuntoFnal}
        onRequestClose={() => {
          setModalRecogida(false);
          setModalPuntoFnal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => {
                setModalRecogida(false);
                setModalPuntoFnal(false);
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            {modalRecogida && (
              <GooglePlacesComponent
                savePlaces={(places) => {
                  const validPlaces = Array.isArray(places) ? places : [];
                  savePlaces(validPlaces);
                }}
                cantElements={3}
                closeModal={closeModal}
              />
            )}
            {modalPuntoFnal && (
              <GooglePlacesComponent
                savePlaces={(place) => {
                  const validPlace = Array.isArray(place) ? place : [];
                  savePlacesFinal(validPlace);
                }}
                cantElements={1}
                closeModal={closeModal}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

// ESTILOS MEJORADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  sectionTitle: {
    color: '#E2991C',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  textArea: {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectInput: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    color: '#999',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridInput: {
    flex: 0.48,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  priceTextInput: {
    flex: 1,
  },
  buttonOutlined: {
    borderWidth: 2,
    borderColor: '#E2991C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonOutlinedText: {
    color: '#E2991C',
    fontSize: 16,
    fontWeight: '600',
  },
  placesList: {
    marginTop: 8,
  },
  placeItem: {
    backgroundColor: '#3a3a3a',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  placeText: {
    color: '#fff',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 0.48,
  },
  dateButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 0.48,
  },
  timeButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageUpload: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
    marginTop: 8,
    fontSize: 14,
  },
  galleryScroll: {
    marginTop: 8,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#E2991C',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarOverlay: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  calendar: {
    borderRadius: 8,
    marginBottom: 16,
  },
  calendarButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#E2991C',
  },
  calendarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#E2991C',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateProgramming;