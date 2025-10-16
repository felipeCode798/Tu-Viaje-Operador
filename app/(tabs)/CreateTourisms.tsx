import React, { useState, useEffect } from 'react';
import {
  Header,
  Icon,
  Overlay,
} from 'react-native-elements';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ModalSelector from 'react-native-modal-selector';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import {
  View,
  Text,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Modal,
  Image,
  FlatList,
  Alert,
  Appearance,
} from 'react-native';

import TourismServices from '../../services/tourismServices';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { GooglePlacesComponent } from '../../components/GooglePlacesComponent';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { helpers } from '../../utils/helpers';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { Picker } from '@react-native-picker/picker';
import { ConfigDay } from '../../components/ConfigDay';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const { height, width } = Dimensions.get('window');
const colorScheme = Appearance.getColorScheme();

// Interfaces
interface ImageOption {
  name: string;
  file: string;
  fileF: any;
  base64: string;
}

interface Destination {
  key: string;
  label: string;
  id: string;
  name: string;
}

interface FetchData {
  fechaInicio: string;
  fechaFin: string;
}

interface MarkedDates {
  [key: string]: {
    startingDay?: boolean;
    endingDay?: boolean;
    color: string;
    textColor: string;
  };
}

interface CuposPorDiaConfig {
  lunes: number;
  martes: number;
  miércoles: number;
  jueves: number;
  viernes: number;
  sábado: number;
  domingo: number;
}

interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
}

const CreateTourisms: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

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
    if (user?.idUser) {
      return { _id: user.idUser, names: user.nombres };
    }
    return null;
  };

  const userData = getUser();
  const userId = userData?._id || userData?.id;

  const [state, setState] = useState({
    user: userId || '',
    nombrePaquete: '',
    descPaquete: '',
    vehiculo: false,
    avion: false,
    nombreVehi: '',
    placa: '',
    alimentacion: false,
    descripcionAlimentacion: '',
    tiquetes: false,
    descripcionTiquetes: '',
    hospedaje: false,
    descripcionHospedaje: '',
    traslados: false,
    descripcionTraslado: '',
    entradas: false,
    descripcionEntradas: '',
    destino: '',
    tipoAcomodacion: '',
    cupos: '',
    nombreGuia: '',
    dias: '',
    noches: '',
    precio: '',
    precioNino: '',
    precioDcto: '',
    statusCalendar: false,
    places: [] as PlaceResult[],
    modalRecogida: false,
    modalPuntoFnal: false,
    statusCalender: false,
    fetchData: {
      fechaInicio: '',
      fechaFin: '',
    },
    horaSalida: '',
    horaLlegada: '',
    infoHoraSalida: '',
    infoHoraLlegada: '',
    DatePickerVisibility: false,
    DatePickerVisibleLlegada: false,
    markedDates: {} as MarkedDates,
    timeVuelta: '',
    startDate: moment(new Date()).format('YYYY-MM-DD'),
    endDate: moment(new Date()).format('YYYY-MM-DD'),
    isStartDatePicked: false,
    isEndDatePicked: false,
    destinoPaquete: {
      key: '-1',
      label: 'Debe seleccionar un destino',
    } as Destination,
    destinos: [] as Destination[],
    desc: false,
    doble: false,
    multiple: false,
    imgPrincipal: null as ImageOption | null,
    imgBanner: null as ImageOption | null,
    imgGallery: [] as ImageOption[],
    paqueteDiario: false,
    configurationDay: '',
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false,
    cuposPorDiaConfig: {
      lunes: 0,
      martes: 0,
      miércoles: 0,
      jueves: 0,
      viernes: 0,
      sábado: 0,
      domingo: 0,
    },
    loading: false,
    validDate: 0,
    place: undefined as PlaceResult | undefined,
  });

  // Helper para actualizar el estado
  const setStateValue = (key: keyof typeof state, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  // Helper para actualizar estado anidado
  const setNestedState = (key: keyof typeof state, nestedKey: string, value: any) => {
    setState(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [nestedKey]: value
      }
    }));
  };

  const savePlaces = (places: PlaceResult[]) => setStateValue('places', places);
  const savePlacesFinal = (place: PlaceResult[]) => setStateValue('place', place[0]);
  const closeModal = () => setStateValue('modalRecogida', false);

  const onDayPress = (day: { dateString: string }) => {
    if (
      state.isStartDatePicked == false ||
      moment(day.dateString) < moment(state.startDate)
    ) {
      let markedDates: MarkedDates = {};
      markedDates[day.dateString] = {
        startingDay: true,
        color: 'orange',
        textColor: '#FFFFFF',
      };
      
      setState(prev => ({
        ...prev,
        markedDates: markedDates,
        isStartDatePicked: true,
        isEndDatePicked: false,
        fetchData: {
          fechaInicio: day.dateString,
          fechaFin: day.dateString,
        },
        startDate: day.dateString,
        endDate: day.dateString,
      }));
    } else {
      let markedDates = state.markedDates;
      let startDate = moment(state.startDate);
      let endDate1 = moment(day.dateString);
      let range = endDate1.diff(startDate, 'days');
      
      setNestedState('fetchData', 'fechaFin', day.dateString);
      setStateValue('endDate', day.dateString);

      if (range > 0) {
        for (let i = 1; i <= range; i++) {
          let tempDate = startDate.add(1, 'day');
          tempDate = moment(tempDate).format('YYYY-MM-DD');
          if (i < range) {
            markedDates[tempDate] = { color: 'orange', textColor: '#FFFFFF' };
          } else {
            markedDates[tempDate] = {
              endingDay: true,
              color: 'orange',
              textColor: '#FFFFFF',
            };
          }
        }
        setState(prev => ({
          ...prev,
          markedDates: markedDates,
          isStartDatePicked: false,
          isEndDatePicked: true,
        }));
      }
    }
  };

  useEffect(() => {
    console.log("🔄 Iniciando carga de destinos...");
    console.log("👤 User ID disponible:", userId);
    console.log("👤 User desde Auth:", user);
    console.log("👤 User desde Params:", userIdFromParams);
    console.log("👤 User desde Redux ID:", idState);
    console.log("👤 User desde Redux Session:", sessionState?.user?.idUser);

    if (userId) {
      console.log("✅ User ID válido encontrado:", userId);
      setStateValue('user', userId); // ✅ Actualizar el estado con el userId
      getDestinations();
    } else {
      console.error("❌ No hay user ID disponible después de todas las fuentes");
      Alert.alert("Error", "No se pudo identificar al usuario. Por favor, vuelve a iniciar sesión.");
    }
  }, [userId]);

  const getDestinations = () => {
    if (!state.user) {
      console.error("❌ No hay user ID en el estado");
      return;
    }
    
    console.log("📡 Llamando getDestinations con user:", state.user);
    
    TourismServices.getDestinationsWithoutPaginate(state.user)
      .then((data: Destination[]) => {
        console.log("✅ Destinos recibidos:", data);
        
        const destinations = data.map(destination => ({
          ...destination,
          key: destination.id,
          label: destination.name,
        }));
        
        console.log(`📍 ${destinations.length} destinos formateados`);
        setStateValue('destinos', destinations);
      })
      .catch(error => {
        console.error("❌ Error obteniendo destinos:", error);
        Alert.alert("Error", "No se pudieron cargar los destinos. Verifica tu conexión.");
      });
  };

  const chooseImage = async (type: string, limit: number) => {
    try {
      console.log(`📸 Iniciando selección de imagen para: ${type}`);
      
      const resp = await helpers.pickImages(limit, [4, 3]);
      
      if (!resp || !resp.uri || resp.uri.length === 0) {
        console.error("❌ No se seleccionó ninguna imagen");
        return;
      }

      let url = resp.uri[0];
      console.log(`✅ URI de imagen obtenida: ${url}`);

      // Verifica que la URI sea válida
      if (!url || typeof url !== 'string' || !url.startsWith('file://')) {
        console.error("❌ URI de imagen no válida:", url);
        Alert.alert("Error", "La imagen seleccionada no es válida");
        return;
      }

      // ✅ Asegúrate de que el objeto tenga la estructura que espera uploadImages
      let options = {
        name: type,
        file: url,
        fileF: resp.file || { assets: [{ uri: url }] }, // Estructura compatible
        base64: resp.base64 || '',
      };

      console.log(`✅ Imagen procesada correctamente para: ${type}`, options);

      switch (type) {
        case 'principal':
          setStateValue('imgPrincipal', options);
          break;
        case 'banner':
          setStateValue('imgBanner', options);
          break;
        case 'gallery':
          let gallery = [...state.imgGallery];
          if (gallery.length >= 5) gallery.shift();
          gallery.push(options);
          setStateValue('imgGallery', gallery);
          break;
      }
    } catch (error) {
      console.error(`❌ Error en chooseImage para ${type}:`, error);
      Alert.alert("Error", "No se pudo procesar la imagen seleccionada");
    }
  };

  const showDatePicker = () => setStateValue('DatePickerVisibility', true);
  const hideDatePicker = () => setStateValue('DatePickerVisibility', false);
  const showDatePickerLlegada = () => setStateValue('DatePickerVisibleLlegada', true);
  const hideDatePickerLlegada = () => setStateValue('DatePickerVisibleLlegada', false);

  const OnlyInfoTime = (date: Date) => {
    const hour = date.getHours();
    const minutes = date.getMinutes();

    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinutes}`;
    return formattedTime;
  };

  const handleConfirm = (date: Date) => {
    hideDatePicker();
    const hour = (date.getHours() + 5 + 24) % 24;
    const minutes = date.getMinutes();

    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinutes}`;

    setStateValue('horaSalida', formattedTime);
    setStateValue('infoHoraSalida', OnlyInfoTime(date));
  };

  const handleConfirmLlegada = (date: Date) => {
    hideDatePickerLlegada();
    const hour = (date.getHours() + 5 + 24) % 24;
    const minutes = date.getMinutes();

    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinutes}`;

    setStateValue('horaLlegada', formattedTime);
    setStateValue('infoHoraLlegada', OnlyInfoTime(date));
  };

  const changeFormat = (number: string): number => {
    if (!number || number === '' || number === 'NaN') return 0;
    
    try {
      // Remover puntos de formato y solo dejar números
      const numeroSinFormato = number.replace(/\./g, '').replace(/\D/g, "");
      const precio = parseInt(numeroSinFormato, 10);
      
      console.log(`💰 Conversión de precio: "${number}" -> ${precio}`);
      
      if (isNaN(precio)) {
        console.warn("⚠️ No se pudo convertir el precio:", number);
        return 0;
      }
      
      return precio;
    } catch (error) {
      console.error("❌ Error en changeFormat:", error);
      return 0;
    }
  };

  const sendUpload = async (id: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Preparando imágenes para subir...');
        
        // Solo recolectar las URIs de las imágenes
        // La subida real se hará en TourismServices.createTourism
        const imageData = {
          principal: state.imgPrincipal?.file || '',
          banner: state.imgBanner?.file || '',
          gallery: state.imgGallery.map(img => img.file).filter(url => url && url.startsWith('file://'))
        };

        console.log('✅ URIs de imágenes preparadas:', imageData);
        resolve(imageData);
        
      } catch (error) {
        console.error('❌ Error preparando imágenes:', error);
        reject(error);
      }
    });
  };

  const onHandleSubmit = () => {
    let validStartDate = moment(state.startDate);
    let validEndtDate = moment(state.endDate);

    let diff = validEndtDate.diff(validStartDate, 'months');

    setStateValue('validDate', diff);

    console.log('--------------validDate', state.validDate);

    const regexName = /^[a-zA-Z0-9\s\-\:]+$/;
    const regexGuia = /^[a-zA-ZñÑ\s]+$/;

    let mensaje: string[] = [];
    
    let obj: any = {
      empresa: state.user,
      nombrePaquete: '',
      transpote: '',
      nombreAuto: '',
      placa: '',
      descPaquete: '',
      alimentacion: state.alimentacion,
      descAlimentacion: '',
      tiquetes: state.tiquetes,
      descTiquetes: '',
      hospedaje: state.hospedaje,
      descHospedaje: '',
      traslado: state.traslados,
      descTraslados: '',
      entradas: state.entradas,
      descEntradas: '',
      destino: '',
      places: [],
      cupos: '',
      nombreGuia: '',
      dias: '',
      noches: '',
      acomodacion: '',
      precioDcto: '',
      precio: '',
      precioNino: '',
      dcto: state.desc,
      imagen: '',
      banner: '',
      gallery: [],
      ida: '',
      vuelta: '',
      paqueteDiario: state.paqueteDiario,
      cuposPorDiaConfig: state.cuposPorDiaConfig,
    };

    if (state.validDate > 6) {
      mensaje.push('*El paquete no puede durar más de 7 meses.');
    }

    if (
      state.imgPrincipal == null ||
      state.imgBanner == null ||
      state.imgGallery.length == 0
    ) {
      mensaje.push('*Debe subir al menos una imagen de cada tipo.');
    }

    if (state.nombrePaquete !== '') {
      obj.nombrePaquete = state.nombrePaquete;
    } else {
      mensaje.push('*Debe poner nombre del paquete.');
    }

    if (regexName.test(state.nombrePaquete)) {
      obj.nombrePaquete = state.nombrePaquete;
    } else {
      mensaje.push(
        '*El nombre del paquete no puede contener caracteres especiales.',
      );
    }

    if (regexName.test(state.nombreVehi)) {
      obj.nombreVehi = state.nombreVehi;
    } else {
      mensaje.push(
        '*El nombre del transporte no puede contener caracteres especiales.',
      );
    }

    if (regexName.test(state.placa)) {
      obj.placa = state.placa;
    } else {
      mensaje.push(
        '*La placa o el número de vuelo no puede contener caracteres especiales.',
      );
    }

    if (regexGuia.test(state.nombreGuia)) {
      obj.nombreGuia = state.nombreGuia;
    } else {
      mensaje.push(
        '*El nombre del guía no puede contener números o caracteres especiales.',
      );
    }

    if (state.vehiculo) {
      obj.transpote = 'Vehiculo';
      obj.nombreAuto = state.nombreVehi;
      obj.placa = state.placa;
    }
    
    if (state.avion) {
      obj.transpote = 'Avion';
      obj.nombreAuto = state.nombreVehi;
      obj.placa = state.placa;
    }

    if (!state.vehiculo && !state.avion) {
      mensaje.push('*Debe seleccionar el tipo de transporte.');
    }

    if (state.descPaquete !== '') {
      obj.descPaquete = state.descPaquete;
    } else {
      mensaje.push('*Debe poner la descripción del paquete.');
    }

    if (state.alimentacion) {
      if (state.descripcionAlimentacion !== '') {
        obj.descAlimentacion = state.descripcionAlimentacion;
      } else {
        mensaje.push('*Debe poner la descripción de la alimentación.');
      }
    }

    if (state.tiquetes) {
      if (state.descripcionTiquetes !== '') {
        obj.descTiquetes = state.descripcionTiquetes;
      } else {
        mensaje.push('*Debe poner la descripción de los tiquetes.');
      }
    }

    if (state.hospedaje) {
      if (state.descripcionHospedaje !== '') {
        obj.descHospedaje = state.descripcionHospedaje;
      } else {
        mensaje.push('*Debe poner la descripción del hospedaje.');
      }
    }

    if (state.traslados) {
      if (state.descripcionTraslado !== '') {
        obj.descTraslados = state.descripcionTraslado;
      } else {
        mensaje.push('*Debe poner la descripción de los traslados.');
      }
    }

    if (state.entradas) {
      if (state.descripcionEntradas !== '') {
        obj.descEntradas = state.descripcionEntradas;
      } else {
        mensaje.push('*Debe poner la descripción de las entradas.');
      }
    }

    if (state.destino !== '') {
      obj.destino = state.destino;
    } else {
      mensaje.push('*Debe seleccionar un destino.');
    }

    if (state.places.length > 0) {
      obj.places = state.places;
    } else {
      mensaje.push('*Debe seleccionar al menos un punto de recogida.');
    }

    if (state.doble) obj.acomodacion = 'Doble';
    if (state.multiple) obj.acomodacion = 'Multiple';
    if (!state.doble && !state.multiple) {
      mensaje.push('*Debe seleccionar el tipo de acomodación.');
    }

    if (state.cupos !== '') {
      obj.cupos = state.cupos;
    } else if (state.cupos === '' && state.paqueteDiario) {
      obj.cupos = '0';
    } else {
      mensaje.push('*Debe poner el número de cupos.');
    }

    if (state.nombreGuia !== '') {
      obj.nombreGuia = state.nombreGuia;
    } else {
      mensaje.push('*Debe poner nombre del guía.');
    }

    if (state.dias !== '') {
      obj.dias = state.dias;
    } else {
      mensaje.push('*Debe poner el número de días.');
    }

    if (state.noches !== '') {
      obj.noches = state.noches;
    } else {
      mensaje.push('*Debe poner el número de noches.');
    }

    if (state.precio !== '') {
      obj.precio = state.precio;
    } else {
      mensaje.push('*Debe poner el precio del paquete.');
    }

    if (state.precioNino !== '') {
      obj.precioNino = state.precioNino;
    } else {
      mensaje.push('*Debe poner el precio de niño del paquete.');
    }

    if (state.desc) {
      if (state.precioDcto !== '') {
        obj.precioDcto = state.precioDcto;
      } else {
        mensaje.push('*Debe poner el precio de descuento del paquete.');
      }
    }

    if (
      state.startDate.trim().length !== 0 &&
      state.horaSalida.trim().length !== 0
    ) {
      const fechaHoraSalida = new Date(`${state.startDate}T${state.horaSalida}:00.000+00:00`);
      obj.ida = fechaHoraSalida;
    } else {
      mensaje.push('*Debe seleccionar una fecha y hora de salida.');
    }

    if (
      state.endDate.trim().length !== 0 &&
      state.horaLlegada.trim().length !== 0
    ) {
      const fechaHoraLlegada = new Date(`${state.endDate}T${state.horaLlegada}:00.000+00:00`);
      obj.vuelta = fechaHoraLlegada;
    } else {
      mensaje.push('*Debe seleccionar una fecha y hora de llegada.');
    }

    // Validaciones de configuración de días
    const cuposConfig = state.cuposPorDiaConfig;
    if (
      ((cuposConfig.sábado === 0 || cuposConfig.sábado === 0) && state.sabado) ||
      ((cuposConfig.domingo === 0 || cuposConfig.domingo === 0) && state.domingo) ||
      ((cuposConfig.lunes === 0 || cuposConfig.lunes === 0) && state.lunes) ||
      ((cuposConfig.martes === 0 || cuposConfig.martes === 0) && state.martes) ||
      ((cuposConfig.miércoles === 0 || cuposConfig.miércoles === 0) && state.miercoles) ||
      ((cuposConfig.jueves === 0 || cuposConfig.jueves === 0) && state.jueves) ||
      ((cuposConfig.viernes === 0 || cuposConfig.viernes === 0) && state.viernes) ||
      (cuposConfig.sábado >= 1 && !state.sabado) ||
      (cuposConfig.domingo >= 1 && !state.domingo) ||
      (cuposConfig.lunes >= 1 && !state.lunes) ||
      (cuposConfig.martes >= 1 && !state.martes) ||
      (cuposConfig.miércoles >= 1 && !state.miercoles) ||
      (cuposConfig.jueves >= 1 && !state.jueves) ||
      (cuposConfig.viernes >= 1 && !state.viernes)
    ) {
      mensaje.push(
        '*Debes seleccionar la configuración desea y asignar sus respectivos cupos diarios.',
      );
    }

    if (
      state.configurationDay == 'configDay' &&
      !state.lunes && !state.martes && !state.miercoles &&
      !state.jueves && !state.viernes && !state.sabado && !state.domingo &&
      cuposConfig.lunes == 0 && cuposConfig.martes == 0 && cuposConfig.miércoles == 0 &&
      cuposConfig.jueves == 0 && cuposConfig.viernes == 0 && cuposConfig.sábado == 0 && cuposConfig.domingo == 0
    ) {
      mensaje.push(
        '*Debes seleccionar al menos un día de la semana y asignar sus respectivos cupos diarios.',
      );
    } else {
      obj.paqueteDiario = state.paqueteDiario;
      console.log('estos es la configuracion de los cupos ', state.cuposPorDiaConfig);
    }

    obj.precio = changeFormat(state.precio);
    obj.precioNino = changeFormat(state.precioNino);
    obj.precioDcto = changeFormat(state.precioDcto);

    console.log('>>>>>>>>>>>>>>>_____________objecto creado___________<<<<<<<<<<<<<<<<<<<<<<', obj);

    if (mensaje.length !== 0) {
    Alert.alert('Alerta', mensaje.join('\n'));
    } else {
      console.log("ENVIANDO DATOS", state.precio, state.precioNino, state.cuposPorDiaConfig);
      setStateValue('loading', true);
      
      // Preparar objeto con las imágenes como objetos (no solo URLs)
      obj.imagen = state.imgPrincipal;
      obj.banner = state.imgBanner;
      obj.gallery = state.imgGallery;
      
      const diasSinTildes: any = {};
      for (let dia in state.cuposPorDiaConfig) {
        const diaSinTildes = dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if ((state.cuposPorDiaConfig as any)[dia] !== 0) {
          diasSinTildes[diaSinTildes] = (state.cuposPorDiaConfig as any)[dia];
        }
      }
      obj.cuposPorDiaConfig = diasSinTildes;

      console.log('----------------obj justo antes de enviar--------------------------', obj);

      // Llamar directamente al servicio sin subir imágenes por separado
      TourismServices.createTourism(obj)
        .then(resp => {
          console.log('-------respuesta de la creacion del turismo --------------', resp);
          Alert.alert("Éxito", "Paquete turístico creado correctamente");
          router.back();
          setStateValue('loading', false);
        })
        .catch(error => {
          console.error('❌ Error creando turismo:', error);
          Alert.alert("Error", "No se pudo crear el paquete turístico. Verifica los datos.");
          setStateValue('loading', false);
        }).catch(e => {
          console.log('error', e);
          Alert.alert("Error", "No se pudieron subir las imágenes");
          setStateValue('loading', false);
        });
    }
  };

  const handleSwitchChange = (day: string, value: boolean) => {
    setState(prevState => ({
      ...prevState,
      cuposPorDiaConfig: {
        ...prevState.cuposPorDiaConfig,
        [day]: value ? parseInt(state.cupos) : 0,
      },
      [day]: value,
    }));
  };

  const daysOfWeek = [
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
    'domingo',
  ];
  const weekend = daysOfWeek.slice(0, 5);
  const weekends = daysOfWeek.slice(5, 7);

  if (state.loading) {
    return <Loader />;
  }

  return (
    <View style={{ backgroundColor: '#4f4f4f' }}>
      <StatusBar barStyle={'light-content'} />
      <Header containerStyle={styles.containerHeader}>
        <View style={styles.header}>
          <Text style={[styles.colorW, { fontSize: height * 0.03 }]}>
            Crear Paquete Turístico
          </Text>
        </View>
        <View style={styles.icon}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome5
              style={{ borderRadius: 100 }}
              name={'arrow-left'}
              size={width * 0.1}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </Header>

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        contentContainerStyle={{flexGrow: 1, paddingBottom: 150,}}
        enableAutomaticScroll={true}
        viewIsInsideTabBar={false}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}>
        <View style={[styles.container]}>
          <ScrollView>
            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Nombre del paquete
              </Text>
              <TextInput
                style={[styles.texColorWite, styles.textInput]}
                keyboardType="default"
                placeholder="Nombre del paquete"
                placeholderTextColor="gray"
                autoCapitalize="none"
                numberOfLines={1}
                onChangeText={text =>
                  setStateValue('nombrePaquete', text)
                }></TextInput>
            </View>
            <View>
              <Text style={[styles.textLabel, styles.texColorWite]}>
                Tipo de transporte
              </Text>
              <View style={styles.checkboxContainer}>
                <Text style={[styles.label, styles.texColorWite]}>
                  vehículo
                </Text>
                <Switch
                  style={styles.switch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.vehiculo ? '#f4f3f4' : '#f4f3f4'}
                  value={state.vehiculo}
                  onValueChange={() =>
                    setState(prev => ({
                      ...prev,
                      vehiculo: !state.vehiculo,
                      avion: false,
                    }))
                  }
                />
                <View></View>

                <Text style={[styles.label, styles.texColorWite]}>Avión</Text>
                <Switch
                  style={styles.switch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.avion ? '#f4f3f4' : '#f4f3f4'}
                  value={state.avion}
                  onValueChange={() =>
                    setState(prev => ({
                      ...prev,
                      avion: !state.avion,
                      vehiculo: false,
                    }))
                  }
                />
              </View>

              {state.vehiculo && (
                <View
                  style={{
                    paddingTop:
                      Platform.OS === 'ios' ? height * 0.02 : height * 0.03,
                  }}>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Marca del vehículo
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textInput]}
                    keyboardType="default"
                    placeholder="Marca del vehículo"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('nombreVehi', text)
                    }></TextInput>

                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Placa del vehículo
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textInput]}
                    keyboardType="default"
                    placeholder="Placa del vehículo"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('placa', text)
                    }></TextInput>
                </View>
              )}
              {state.avion && (
                <View
                  style={{
                    paddingTop:
                      Platform.OS === 'ios' ? height * 0.02 : height * 0.03,
                  }}>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Nombre de la aerolínea
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textInput]}
                    keyboardType="default"
                    placeholder="Nombre de la aerolinea"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('nombreVehi', text)
                    }></TextInput>

                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Número de vuelo
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textInput]}
                    keyboardType="default"
                    placeholder="Número de vuelo"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('placa', text)
                    }></TextInput>
                </View>
              )}
              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.015 : height * 0.025,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.02 : height * 0.01,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Descripción general del paquete turístico
                </Text>
                <TextInput
                  style={[styles.texColorWite, styles.textDes]}
                  keyboardType="default"
                  multiline={true}
                  placeholder="Descripción general del paquete turístico"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  onChangeText={text =>
                    setStateValue('descPaquete', text)
                  }></TextInput>
              </View>
              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Incluye alimentación
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.desc ? '#E2991C' : '#f4f3f4'}
                  value={state.alimentacion}
                  onValueChange={() =>
                    setStateValue('alimentacion', !state.alimentacion)
                  }
                />
              </View>
              {state.alimentacion && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Descripción sobre alimentación
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textDes]}
                    keyboardType="default"
                    multiline={true}
                    placeholder="Descripción sobre alimentacin"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('descripcionAlimentacion', text)
                    }></TextInput>
                </View>
              )}
              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Incluye tiquetes o pasajes
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.desc ? '#E2991C' : '#f4f3f4'}
                  value={state.tiquetes}
                  onValueChange={() =>
                    setStateValue('tiquetes', !state.tiquetes)
                  }
                />
              </View>
              {state.tiquetes && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Descripción sobre tiquetes o pasajes
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textDes]}
                    keyboardType="default"
                    numberOfLines={5}
                    multiline={true}
                    placeholder="Descripción sobre tiquetes o pasajes"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('descripcionTiquetes', text)
                    }></TextInput>
                </View>
              )}
              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Incluye hospedaje
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.desc ? '#E2991C' : '#f4f3f4'}
                  value={state.hospedaje}
                  onValueChange={() =>
                    setStateValue('hospedaje', !state.hospedaje)
                  }
                />
              </View>
              {state.hospedaje && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Descripción sobre los hospedaje
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textDes]}
                    keyboardType="default"
                    numberOfLines={5}
                    multiline={true}
                    placeholder="Descripción sobre hospedaje"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('descripcionHospedaje', text)
                    }></TextInput>
                </View>
              )}
              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Incluye traslados
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.desc ? '#E2991C' : '#f4f3f4'}
                  value={state.traslados}
                  onValueChange={() =>
                    setStateValue('traslados', !state.traslados)
                  }
                />
              </View>
              {state.traslados && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Descripción sobre los traslados
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textDes]}
                    keyboardType="default"
                    numberOfLines={5}
                    multiline={true}
                    placeholder="Descripción sobre los traslados"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('descripcionTraslado', text)
                    }></TextInput>
                </View>
              )}
              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Incluye entradas turísticas
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.desc ? '#E2991C' : '#f4f3f4'}
                  value={state.entradas}
                  onValueChange={() =>
                    setStateValue('entradas', !state.entradas)
                  }
                />
              </View>
              {state.entradas && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Descripción sobre las entradas turísticas
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textDes]}
                    keyboardType="default"
                    numberOfLines={5}
                    multiline={true}
                    placeholder="Descripción sobre las entradas turísticas"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setStateValue('descripcionEntradas', text)
                    }></TextInput>
                </View>
              )}
              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.015 : height * 0.025,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.004 : height * 0.01,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Destino del paquete turístico
                </Text>

                {state.destinos.length > 0 ? (
                  <ModalSelector
                    data={state.destinos}
                    onChange={option => {
                      console.log("📍 Destino seleccionado:", option);
                      setState(prev => ({
                        ...prev,
                        destinoPaquete: {
                          key: option.key,
                          label: option.label,
                        },
                        destino: option.key,
                      }));
                    }}
                    initValue="Seleccionar destino"
                    cancelText="Cancelar"
                    optionTextStyle={{color: 'black'}}
                    optionContainerStyle={{
                      backgroundColor: 'white',
                      maxHeight: height * 0.4,
                    }}>
                    <Text style={[styles.textSelect, styles.texColorWite, styles.textInput]}>
                      {state.destinoPaquete.label}
                    </Text>
                  </ModalSelector>
                ) : (
                  <Text style={[styles.textSelect, styles.texColorWite, styles.textInput, {color: 'gray'}]}>
                    Cargando destinos...
                  </Text>
                )}
              </View>
              {/* Puntos de recogida */}
              <View>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Puntos de recogida
                </Text>
                <Text
                  style={[styles.texColorWite, styles.textInput]}
                  onPress={() => setStateValue('modalRecogida', true)}>
                  Añadir puntos de recogida
                </Text>

                <View>
                  {state.places.map((punto, i) => {
                    return (
                      <Text
                        key={i}
                        style={[styles.textLabel, styles.texColorWite]}>
                        {punto.name}
                      </Text>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Paquete turístico diario
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={
                    state.paqueteDiario ? '#f4f3f4' : '#f4f3f4'
                  }
                  value={state.paqueteDiario}
                  onValueChange={() =>
                    setStateValue('paqueteDiario', !state.paqueteDiario)
                  }
                />
              </View>

              {state.paqueteDiario ? (
                <View style={{color: 'white'}}>
                  <Text style={[styles.label, styles.texColorWite]}>
                    Repeticiones
                  </Text>

                  <Picker
                    dropdownIconColor= {'white'}
                    style={{color: 'white'}}
                    selectedValue={state.configurationDay}
                    onValueChange={(itemValue, itemIndex) => {
                      setStateValue('configurationDay', itemValue);
                      console.log(
                        '---------------------itemaVAlue',
                        itemValue,
                      );

                      if (itemValue == 'everyDay') {
                        setState(prev => ({
                          ...prev,
                          lunes: true,
                          martes: true,
                          miercoles: true,
                          jueves: true,
                          viernes: true,
                          sabado: true,
                          domingo: true,
                          cuposPorDiaConfig: {
                            lunes: 0,
                            martes: 0,
                            miércoles: 0,
                            jueves: 0,
                            viernes: 0,
                            sábado: 0,
                            domingo: 0,
                          },
                        }));
                      }
                      if (itemValue == 'sl') {
                        setState(prev => ({
                          ...prev,
                          lunes: true,
                          martes: true,
                          miercoles: true,
                          jueves: true,
                          viernes: true,
                          sabado: false,
                          domingo: false,
                          cuposPorDiaConfig: {
                            lunes: 0,
                            martes: 0,
                            miércoles: 0,
                            jueves: 0,
                            viernes: 0,
                            sábado: 0,
                            domingo: 0,
                          },
                        }));
                      }
                      if (itemValue == 'fds') {
                        setState(prev => ({
                          ...prev,
                          lunes: false,
                          martes: false,
                          miercoles: false,
                          jueves: false,
                          viernes: false,
                          sabado: true,
                          domingo: true,
                          cuposPorDiaConfig: {
                            lunes: 0,
                            martes: 0,
                            miércoles: 0,
                            jueves: 0,
                            viernes: 0,
                            sábado: 0,
                            domingo: 0,
                          },
                        }));
                      }
                      if (itemValue == 'configDay') {
                        setState(prev => ({
                          ...prev,
                          lunes: false,
                          martes: false,
                          miercoles: false,
                          jueves: false,
                          viernes: false,
                          sabado: false,
                          domingo: false,
                          cuposPorDiaConfig: {
                            lunes: 0,
                            martes: 0,
                            miércoles: 0,
                            jueves: 0,
                            viernes: 0,
                            sábado: 0,
                            domingo: 0,
                          },
                        }));
                      }
                    }}>
                    <Picker.Item label="Seleccione" value="nothing" />
                    <Picker.Item label="Todos los días" value="everyDay" />
                    <Picker.Item label="Semana laboral" value="sl" />
                    <Picker.Item label="Fin de semana" value="fds" />
                    <Picker.Item label="Personalizado" value="configDay" />
                    
                  </Picker>

                  {state.configurationDay === 'everyDay' && (
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                      {daysOfWeek.map(day => (
                        <ConfigDay
                          key={day}
                          title={day}
                          onCuposChange={cupos =>
                            setState(prev => ({
                              ...prev,
                              cuposPorDiaConfig: {
                                ...prev.cuposPorDiaConfig,
                                [day]: cupos,
                              },
                            }))
                          }
                        />
                      ))}
                    </View>
                  )}

                  {state.configurationDay === 'sl' && (
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                      {weekend.map(day => (
                        <ConfigDay
                          key={day}
                          title={day}
                          onCuposChange={cupos =>
                            setState(prev => ({
                              ...prev,
                              cuposPorDiaConfig: {
                                ...prev.cuposPorDiaConfig,
                                [day]: cupos,
                              },
                            }))
                          }
                        />
                      ))}
                    </View>
                  )}

                  {state.configurationDay === 'fds' && (
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                      {weekends.map(day => (
                        <ConfigDay
                          key={day}
                          title={day}
                          onCuposChange={cupos =>
                            setState(prev => ({
                              ...prev,
                              cuposPorDiaConfig: {
                                ...prev.cuposPorDiaConfig,
                                [day]: cupos,
                              },
                            }))
                          }
                        />
                      ))}
                    </View>
                  )}

                  {state.configurationDay === 'configDay' && (
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                      <ConfigDay
                        title="lunes"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              lunes: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('lunes', !state.lunes);
                        }}
                        switchDay={true}
                        active={state.lunes}
                      />
                      <ConfigDay
                        title="martes"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              martes: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('martes', !state.martes);
                        }}
                        switchDay={true}
                        active={state.martes}
                      />
                      <ConfigDay
                        title="Miércoles"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              miercoles: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('miercoles', !state.miercoles);
                        }}
                        switchDay={true}
                        active={state.miercoles}
                      />
                      <ConfigDay
                        title="jueves"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              jueves: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('jueves', !state.jueves);
                        }}
                        switchDay={true}
                        active={state.jueves}
                      />
                      <ConfigDay
                        title="viernes"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              viernes: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('viernes', !state.viernes);
                        }}
                        switchDay={true}
                        active={state.viernes}
                      />
                      <ConfigDay
                        title="sábado"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              sabado: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('sabado', !state.sabado);
                        }}
                        switchDay={true}
                        active={state.sabado}
                      />
                      <ConfigDay
                        title="domingo"
                        onCuposChange={cupos =>
                          setState(prev => ({
                            ...prev,
                            cuposPorDiaConfig: {
                              ...prev.cuposPorDiaConfig,
                              domingo: cupos,
                            },
                          }))
                        }
                        onSwichChange={() => {
                          setStateValue('domingo', !state.domingo);
                        }}
                        switchDay={true}
                        active={state.domingo}
                      />
                    </View>
                  )}
                </View>
              ) : null}

              <Text style={[styles.textLabel, styles.texColorWite]}>
                {state.paqueteDiario
                  ? 'Rango fechas del paquete diario'
                  : 'Escoge las fechas de salida y regreso'}
              </Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }}>
                <TouchableOpacity
                  style={{...styles.input, width: '37%'}}
                  onPress={() => setStateValue('statusCalendar', true)}>
                  <View style={styles.textWithIcon}>
                    <Icon
                      name="calendar"
                      size={21}
                      color="orange"
                      type="material-community"
                    />
                    <Text style={styles.inputTextFiltros}>
                      {state.startDate}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={{paddingTop: 10, marginTop: 10}}>
                  <Icon
                    name="arrows-v"
                    size={10}
                    color="gray"
                    type="font-awesome"
                  />
                </View>
                <TouchableOpacity
                  style={{...styles.input, width: '37%'}}
                  onPress={() => setStateValue('statusCalendar', true)}>
                  <View style={styles.textWithIcon}>
                    <Icon
                      name="calendar"
                      size={21}
                      color="orange"
                      type="material-community"
                    />
                    <Text style={styles.inputTextFiltros}>
                      {state.endDate}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              {state.statusCalendar && (
                <Overlay
                  isVisible={state.statusCalendar}
                  windowBackgroundColor="rgba(41, 41, 41, .7)"
                  width={width * 0.9}
                  height={440}>
                  <Calendar
                    minDate={Date()}
                    monthFormat={'MMMM yyyy'}
                    markedDates={state.markedDates}
                    markingType="period"
                    hideExtraDays={true}
                    hideDayNames={true}
                    onDayPress={onDayPress}
                    style={{
                      marginBottom: 30,
                      height: 330,
                    }}
                    theme={{
                      calendarBackground:
                        colorScheme === 'dark' ? 'while' : 'while',
                      textDisabledColor:
                        colorScheme === 'dark' ? 'black' : 'black',
                    }}
                  />
                  <View
                    style={{
                      ...styles.inputContainer,
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={{
                        ...styles.Botton,
                        backgroundColor: '#000',
                        width: '47%',
                      }}
                      onPress={() => {
                        setState(prev => ({
                          ...prev,
                          statusCalendar: false,
                          startDate: moment(Date()).format('YYYY-MM-DD'),
                          endDate: moment(Date()).format('YYYY-MM-DD'),
                        }));
                      }}>
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{...styles.button, width: '47%'}}
                      onPress={() => {
                        setStateValue('statusCalendar', false);
                      }}>
                      <Text style={styles.buttonText}>Aceptar</Text>
                    </TouchableOpacity>
                  </View>
                </Overlay>
              )}

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.01 : height * 0.015,
                }}>
                <TouchableOpacity
                  style={{
                    ...styles.Botton,
                    backgroundColor: '#4f4f4f',
                    width: '100%',
                  }}
                  onPress={() => {
                    showDatePickerLlegada();
                  }}>
                  <DateTimePickerModal
                    isVisible={state.DatePickerVisibleLlegada}
                    mode="time"
                    onConfirm={handleConfirmLlegada}
                    onCancel={hideDatePickerLlegada}
                    locale='es_CO'
                  />
                  <Text
                    style={{
                      ...styles.texColorWite,
                      ...styles.textInput,
                      backgroundColor: 'rgba(41, 41, 41, .7)',
                      width: width * 0.8,
                    }}>
                    Hora de llegada:
                    {state.infoHoraLlegada}
                  
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.01 : height * 0.015,
                }}>
                <TouchableOpacity
                  style={{
                    ...styles.Botton,
                    backgroundColor: '#4f4f4f',
                    width: '100%',
                  }}
                  onPress={() => {
                    showDatePicker();
                  }}>
                  <DateTimePickerModal
                    isVisible={state.DatePickerVisibility}
                    mode="time"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    locale = 'es_CO'
                  
                  />
                  <Text
                    style={{
                      ...styles.texColorWite,
                      ...styles.textInput,
                      backgroundColor: 'rgba(41, 41, 41, .7)',
                      width: width * 0.8,
                    }}>
                    Hora de salida:
                    {state.infoHoraSalida}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.textLabel, styles.texColorWite]}>
                Tipo de acomodación
              </Text>
              <View style={styles.checkboxContainer}>
                <Text style={[styles.label, styles.texColorWite]}>Doble</Text>
                <Switch
                  style={styles.switch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.doble ? '#f4f3f4' : '#f4f3f4'}
                  value={state.doble}
                  onValueChange={() => {
                    setState(prev => ({
                      ...prev,
                      doble: !state.doble,
                      multiple: false,
                    }));
                  }}
                />

                <Text style={[styles.label, styles.texColorWite]}>
                  Múltiple
                </Text>
                <Switch
                  style={styles.switch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.multiple ? '#f4f3f4' : '#f4f3f4'}
                  value={state.multiple}
                  onValueChange={() => {
                    setState(prev => ({
                      ...prev,
                      multiple: !state.multiple,
                      doble: false,
                    }));
                  }}
                />
              </View>

              {!state.paqueteDiario && (
                <View
                  style={{
                    paddingTop:
                      Platform.OS === 'ios' ? height * 0.015 : height * 0.001,
                    marginBottom:
                      Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  }}>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Cupos disponibles
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textInput]}
                    keyboardType="numeric"
                    placeholder="Cupos disponibles"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    numberOfLines={1}
                    onChangeText={text =>
                      setStateValue('cupos', text)
                    }></TextInput>
                </View>
              )}

              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.01 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Nombre del guía
                </Text>
                <TextInput
                  style={[styles.texColorWite, styles.textInput]}
                  keyboardType="default"
                  placeholder="Nombre del guia"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  numberOfLines={1}
                  onChangeText={text =>
                    setStateValue('nombreGuia', text)
                  }></TextInput>
              </View>
              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Días
                </Text>
                <TextInput
                  style={[styles.texColorWite, styles.textInput]}
                  keyboardType="numeric"
                  placeholder="Días"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  numberOfLines={1}
                  onChangeText={text =>
                    setStateValue('dias', text)
                  }></TextInput>
              </View>
              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Noches
                </Text>
                <TextInput
                  style={[styles.texColorWite, styles.textInput]}
                  keyboardType="numeric"
                  placeholder="Noches"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  numberOfLines={1}
                  onChangeText={text =>
                    setStateValue('noches', text)
                  }></TextInput>
              </View>
              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Precio del paquete por adulto
                </Text>
                <TextInput
                  style={[styles.texColorWite, styles.textInput]}
                  keyboardType="numeric"
                  placeholder="$"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  numberOfLines={1}
                  value={state.precio.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  onChangeText={text =>
                    setStateValue('precio', text)
                  }></TextInput>
              </View>
              <View>
                <Text style={[styles.label, styles.texColorWite]}>
                  Incluye descuento
                </Text>
                <Switch
                  style={styles.containerSwitch}
                  trackColor={{false: '#767577', true: '#E2770f'}}
                  thumbColor={state.desc ? '#f4f3f4' : '#f4f3f4'}
                  value={state.desc}
                  onValueChange={() =>
                    setStateValue('desc', !state.desc)
                  }
                />
              </View>
              {state.desc && (
                <View>
                  <Text style={[styles.textLabel, styles.texColorWite]}>
                    Precio del paquete con descuento por adulto
                  </Text>
                  <TextInput
                    style={[styles.texColorWite, styles.textDes]}
                    keyboardType="numeric"
                    numberOfLines={1}
                    multiline={true}
                    placeholder="Descuento"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    value={state.precioDcto.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    onChangeText={text =>
                      setStateValue('precioDcto', text)
                    }></TextInput>
                </View>
              )}

              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Precio del paquete por niño
                </Text>
                <TextInput
                  style={[styles.texColorWite, styles.textInput]}
                  keyboardType="numeric"
                  placeholder="$"
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  numberOfLines={1}
                  value={state.precioNino.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  onChangeText={text =>
                    setStateValue('precioNino', text)
                  }></TextInput>
              </View>

              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Imagen principal
                </Text>

                {state.imgPrincipal && (
                  <Image
                    source={{uri: state.imgPrincipal.file}}
                    style={{
                      height: 130,
                      width: 130,
                      alignSelf: 'center',
                      borderRadius: 10,
                    }}
                  />
                )}

                <TouchableOpacity
                  style={{
                    ...styles.button,
                    marginTop: height * 0.01,
                    width: width * 0.7,
                    alignSelf: 'center',
                  }}
                  onPress={() => chooseImage('principal', 1)}>
                  <Text style={styles.text}>
                    {state.imgPrincipal ? 'Cambiar' : 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom:
                    Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Imagen del banner
                </Text>

                {state.imgBanner && (
                  <Image
                    source={{uri: state.imgBanner.file}}
                    style={{
                      height: 130,
                      width: 130,
                      alignSelf: 'center',
                      borderRadius: 10,
                    }}
                  />
                )}

                <TouchableOpacity
                  style={{
                    ...styles.button,
                    marginTop: height * 0.01,
                    width: width * 0.7,
                    alignSelf: 'center',
                  }}
                  onPress={() => chooseImage('banner', 1)}>
                  <Text style={styles.text}>
                    {' '}
                    {state.imgBanner ? 'Cambiar' : 'Seleccionar'}{' '}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop: Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                  marginBottom: Platform.OS === 'ios' ? height * 0.001 : height * 0.001,
                }}>
                <Text style={[styles.textLabel, styles.texColorWite]}>
                  Galería de imágenes
                </Text>

                {state.imgGallery.length != 0 && (
                  // REEMPLAZA el FlatList con esto:
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
                    {state.imgGallery.map((item, index) => (
                      <Image
                        key={index.toString()}
                        source={{ uri: item.file }}
                        style={{
                          height: 130,
                          width: 130,
                          borderRadius: 10,
                          margin: 5,
                        }}
                      />
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={{
                    ...styles.button,
                    marginTop: height * 0.01,
                    width: width * 0.7,
                    alignSelf: 'center',
                  }}
                  onPress={() => chooseImage('gallery', 5)}>
                  <Text style={styles.text}>
                    {state.imgGallery.length > 0 ? 'Agregar más' : 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <View
                  style={{
                    alignSelf: 'center',
                    paddingTop: height * 0.01,
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    style={{...styles.button}}
                    onPress={onHandleSubmit}>
                    <Text style={styles.text}>Crear paquete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>

      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={state.modalRecogida || state.modalPuntoFnal}
          onRequestClose={() => {
            setStateValue('modalRecogida', false);
          }}>
          <View style={styles.centeredView}>
            <TouchableOpacity
              onPress={() =>
                setStateValue('modalRecogida', false)
              }
              style={styles.BottonClose}>
              <Text style={[styles.text, styles.textClose]}>X</Text>
            </TouchableOpacity>

            <View style={styles.modal}>
              {state.modalRecogida && (
                <GooglePlacesComponent
                  savePlaces={savePlaces}
                  cantElements={3}
                  closeModal={closeModal}
                />
              )}
              {state.modalPuntoFnal && (
                <GooglePlacesComponent
                  savePlaces={savePlacesFinal}
                  cantElements={1}
                  closeModal={closeModal}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

// Los estilos permanecen exactamente igual
const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginBottom: 100,
    backgroundColor: '#4f4f4f',
  },
  containerHeader: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  header: {
    position: 'relative',
    top: -height * 0.004,
    width: width * 1,
    alignItems: 'center',
  },
  out: {
    position: 'absolute',
    right: -width * 0.15,
    top: height * -0.02,
  },
  modal: {
    backgroundColor: '#4f4f4f',
    borderRadius: width * 0.05,
    shadowColor: '#000',
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
    alignContent: 'center',
  },
  textLabel: {
    fontSize: Platform.OS === 'ios' ? height * 0.024 : height * 0.028,
    marginTop: Platform.OS === 'ios' ? height * 0.015 : height * 0.02,
    marginBottom: Platform.OS === 'ios' ? height * 0.01 : height * 0.01,
    textAlign: 'center',
  },
  textSelect: {
    fontSize: Platform.OS === 'ios' ? height * 0.015 : height * 0.013,
    marginVertical: 7,
    paddingVertical: 7,
    textAlign: 'center',
    borderColor: 'white',
    lineHeight: Platform.OS === 'ios' ? height * 0.02 : height * 0.05,
    borderWidth: width * 0.002,
    borderRadius: Platform.OS === 'ios' ? height * 0.02 : height * 0.022,
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    marginVertical: 0,
  },
  textInput: {
    fontSize: Platform.OS === 'ios' ? height * 0.015 : height * 0.016,
    marginVertical: 7,
    paddingVertical: 7,
    textAlign: 'center',
    borderColor: 'white',
    lineHeight: Platform.OS === 'ios' ? height * 0.02 : height * 0.02,
    borderWidth: width * 0.002,
    borderRadius: height * 0.02,
  },
  textDes: {
    fontSize: Platform.OS === 'ios' ? height * 0.015 : height * 0.013,
    marginVertical: 7,
    paddingVertical: 7,
    textAlign: 'center',
    borderColor: 'white',
    lineHeight: Platform.OS === 'ios' ? height * 0.02 : height * 0.05,
    borderWidth: Platform.OS === 'ios' ? height * 0.001 : height * 0.0015,
    borderRadius: Platform.OS === 'ios' ? height * 0.01 : height * 0.02,
  },
  textSwitch: {
    width: width * 0.1,
  },
  switch: {
    borderWidth: width * 0.0003,
    borderRadius: width * 0.03,
    top: Platform.OS === 'ios' ? height * 0.02 : height * 0.013,
  },
  disable: {
    borderColor: 'red',
    color: 'red',
  },
  texColorWite: {
    color: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    margin: 3,
    top: Platform.OS === 'ios' ? height * 0.005 : height * 0.015,
  },
  containerSwitch: {
    borderWidth: width * 0.0003,
    borderRadius: width * 0.03,
    left: Platform.OS === 'ios' ? width * 0.7 : width * 0.001,
    top: Platform.OS === 'ios' ? -height * 0.02 : -height * 0.013,
  },
  Botton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    width: 325,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textClose: {
    lineHeight: Platform.OS === 'ios' ? width * 0.09 : width * 0.076,
  },
  btnDates: {
    alignItems: 'center',
    flexDirection: 'row',
    alignContent: 'center',
  },
  button: {
    backgroundColor: 'orange',
    borderRadius: 20,
    width: width * 0.5,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  MainContainer: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: Platform.OS === 'ios' ? height * 0.015 : height * 0.02,
    color: 'black',
    padding: 3,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 15,
    width: width * 0.35,
    height: width * 0.123,
  },
  textWithIcon: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 18,
    height: width * 0.05,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
  },
  colorW: {
    color: '#fff',
  },
  icon: {
    borderRadius: 100,
    backgroundColor: 'transparent',
    color: 'transparent',
    position: 'absolute',
    top: -height * 0.028,
    left: -width * 0.17,
    alignItems: 'flex-start',
    zIndex: 1,
  },
  inputTextFiltros: {
    color: 'black',
  },
  containerDay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    alignContent: 'center',
  },
  BottonClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'orange',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateTourisms;