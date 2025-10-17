import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Appearance,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Icon,
  Overlay
} from 'react-native-elements';

import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { GooglePlacesComponent } from '../../components/GooglePlacesComponent';
import TourismServices from '../../services/tourismServices';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { helpers } from '../../utils/helpers';

import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../contexts/AuthContext';
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
    if (userId) {;
      setStateValue('user', userId);
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
    
    TourismServices.getDestinationsWithoutPaginate(state.user)
      .then((data: Destination[]) => {
        const destinations = data.map(destination => ({
          ...destination,
          key: destination.id,
          label: destination.name,
        }));
        
        setStateValue('destinos', destinations);
      })
      .catch(error => {
        console.error("❌ Error obteniendo destinos:", error);
        Alert.alert("Error", "No se pudieron cargar los destinos. Verifica tu conexión.");
      });
  };

  const chooseImage = async (type: string, limit: number) => {
    try {
      const resp = await helpers.pickImages(limit, [4, 3]);
      
      if (!resp || !resp.uri || resp.uri.length === 0) {
        console.error("❌ No se seleccionó ninguna imagen");
        return;
      }
      let url = resp.uri[0];

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

  const handleCuposChange = (dia: string, valor: string) => {
    const cuposNum = valor === '' ? 0 : parseInt(valor.replace(/\D/g, ''), 10);
    setState(prev => ({
      ...prev,
      cuposPorDiaConfig: {
        ...prev.cuposPorDiaConfig,
        [dia]: isNaN(cuposNum) ? 0 : cuposNum,
      },
    }));
  };

  const getDiasSeleccionados = () => {
    const { configurationDay, lunes, martes, miercoles, jueves, viernes, sabado, domingo } = state;
    
    if (configurationDay === 'everyDay') {
      return ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    } else if (configurationDay === 'sl') {
      return ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
    } else if (configurationDay === 'fds') {
      return ['sábado', 'domingo'];
    } else if (configurationDay === 'configDay') {
      const dias = [];
      if (lunes) dias.push('lunes');
      if (martes) dias.push('martes');
      if (miercoles) dias.push('miércoles');
      if (jueves) dias.push('jueves');
      if (viernes) dias.push('viernes');
      if (sabado) dias.push('sábado');
      if (domingo) dias.push('domingo');
      return dias;
    }
    return [];
  };


  const changeFormat = (number: string): number => {
    if (!number || number === '' || number === 'NaN') return 0;
    
    try {
      // Remover puntos de formato y solo dejar números
      const numeroSinFormato = number.replace(/\./g, '').replace(/\D/g, "");
      const precio = parseInt(numeroSinFormato, 10);
      
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

  // ✅ CORRECCIÓN: Función sendUpload corregida para subir imágenes
  const sendUpload = async (id: string): Promise<{imgPrincipal: string, imgBanner: string, imgGallery: string[]}> => {
    return new Promise(async (resolve, reject) => {
      try {
        let imgPrincipal = '';
        let imgBanner = '';
        let imgGallery: string[] = [];

        // ✅ Subir imagen principal
        if (state.imgPrincipal && state.imgPrincipal.file) {
          imgPrincipal = await helpers.uploadImages(
            state.imgPrincipal,
            id,
            'turismo',
            state.nombrePaquete,
            'principal'
          );
        }

        // ✅ Subir imagen banner
        if (state.imgBanner && state.imgBanner.file) {
          imgBanner = await helpers.uploadImages(
            state.imgBanner,
            id,
            'turismo',
            state.nombrePaquete,
            'banner'
          );
        }

        // ✅ Subir galería de imágenes
        if (state.imgGallery && Array.isArray(state.imgGallery) && state.imgGallery.length > 0) {
          for (let i = 0; i < state.imgGallery.length; i++) {
            const galleryItem = state.imgGallery[i];
            
            if (galleryItem && galleryItem.file) {
              const galleryImage = await helpers.uploadImages(
                galleryItem,
                id,
                'turismo',
                state.nombrePaquete,
                'gallery'
              );
              
              imgGallery.push(galleryImage);
            }
          }
        }

        const result = {
          imgPrincipal,
          imgBanner,
          imgGallery
        };

        resolve(result);
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const onHandleSubmit = async () => {
    let validStartDate = moment(state.startDate);
    let validEndtDate = moment(state.endDate);

    let diff = validEndtDate.diff(validStartDate, 'months');

    setStateValue('validDate', diff);

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
      // ✅ CORRECCIÓN: Crear fecha correctamente para Date.parse()
      const fechaHoraSalida = new Date(`${state.startDate}T${state.horaSalida}:00.000+00:00`);
      obj.ida = fechaHoraSalida;
    } else {
      mensaje.push('*Debe seleccionar una fecha y hora de salida.');
    }

    if (
      state.endDate.trim().length !== 0 &&
      state.horaLlegada.trim().length !== 0
    ) {
      // ✅ CORRECCIÓN: Crear fecha correctamente para Date.parse()
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
    }

    obj.precio = changeFormat(state.precio);
    obj.precioNino = changeFormat(state.precioNino);
    obj.precioDcto = changeFormat(state.precioDcto);

    if (mensaje.length !== 0) {
      Alert.alert('Alerta', mensaje.join('\n'));
    } else {
      setStateValue('loading', true);
      
      try {
        const uploadedImages = await sendUpload(state.user);
        
        // Preparar objeto con las URLs de imágenes subidas
        obj.imagen = uploadedImages.imgPrincipal;
        obj.banner = uploadedImages.imgBanner;
        obj.gallery = uploadedImages.imgGallery;
        
        const diasSinTildes: any = {};
        for (let dia in state.cuposPorDiaConfig) {
          const diaSinTildes = dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if ((state.cuposPorDiaConfig as any)[dia] !== 0) {
            diasSinTildes[diaSinTildes] = (state.cuposPorDiaConfig as any)[dia];
          }
        }
        obj.cuposPorDiaConfig = diasSinTildes;

        // Llamar al servicio con los datos completos
        const resp = await TourismServices.createTourism(obj);
        Alert.alert("Éxito", "Paquete turístico creado correctamente");
        router.back();
        
      } catch (error) {
        console.error('❌ Error creando turismo:', error);
        Alert.alert("Error", "No se pudo crear el paquete turístico. Verifica los datos.");
      } finally {
        setStateValue('loading', false);
      }
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
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      
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
          Crear Paquete Turístico
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
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del paquete</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ingresa el nombre del paquete"
                placeholderTextColor="#999"
                value={state.nombrePaquete}
                onChangeText={text => setStateValue('nombrePaquete', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción general</Text>
              <TextInput
                style={styles.textArea}
                multiline={true}
                numberOfLines={4}
                placeholder="Describe el paquete turístico..."
                placeholderTextColor="#999"
                value={state.descPaquete}
                onChangeText={text => setStateValue('descPaquete', text)}
              />
            </View>
          </View>

          {/* SECCIÓN TRANSPORTE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transporte</Text>
            
            <View style={styles.switchGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Vehículo</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#E2991C'}}
                  thumbColor={state.vehiculo ? '#f4f3f4' : '#f4f3f4'}
                  value={state.vehiculo}
                  onValueChange={() => setState(prev => ({
                    ...prev,
                    vehiculo: !state.vehiculo,
                    avion: false,
                  }))}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Avión</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#E2991C'}}
                  thumbColor={state.avion ? '#f4f3f4' : '#f4f3f4'}
                  value={state.avion}
                  onValueChange={() => setState(prev => ({
                    ...prev,
                    avion: !state.avion,
                    vehiculo: false,
                  }))}
                />
              </View>
            </View>

            {(state.vehiculo || state.avion) && (
              <View style={styles.transportDetails}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {state.vehiculo ? 'Marca del vehículo' : 'Nombre de la aerolínea'}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={state.vehiculo ? "Ej: Toyota" : "Ej: Avianca"}
                    placeholderTextColor="#999"
                    value={state.nombreVehi}
                    onChangeText={text => setStateValue('nombreVehi', text)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {state.vehiculo ? 'Placa del vehículo' : 'Número de vuelo'}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={state.vehiculo ? "Ej: ABC123" : "Ej: AV815"}
                    placeholderTextColor="#999"
                    value={state.placa}
                    onChangeText={text => setStateValue('placa', text)}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECCIÓN SERVICIOS INCLUIDOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Incluidos</Text>
            
            {[
              { key: 'alimentacion', label: 'Alimentación', desc: 'descripcionAlimentacion' },
              { key: 'tiquetes', label: 'Tiquetes o pasajes', desc: 'descripcionTiquetes' },
              { key: 'hospedaje', label: 'Hospedaje', desc: 'descripcionHospedaje' },
              { key: 'traslados', label: 'Traslados', desc: 'descripcionTraslado' },
              { key: 'entradas', label: 'Entradas turísticas', desc: 'descripcionEntradas' },
            ].map(service => (
              <View key={service.key}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{service.label}</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#E2991C'}}
                    thumbColor={state[service.key as keyof typeof state] ? '#f4f3f4' : '#f4f3f4'}
                    value={state[service.key as keyof typeof state] as boolean}
                    onValueChange={() => setStateValue(service.key as keyof typeof state, !state[service.key as keyof typeof state])}
                  />
                </View>
                
                {state[service.key as keyof typeof state] && (
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.textArea}
                      multiline={true}
                      numberOfLines={3}
                      placeholder={`Describe ${service.label.toLowerCase()}...`}
                      placeholderTextColor="#999"
                      value={state[service.desc as keyof typeof state] as string}
                      onChangeText={text => setStateValue(service.desc as keyof typeof state, text)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* SECCIÓN DESTINO Y RECOGIDA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destino y Recogida</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destino del paquete</Text>
              <TouchableOpacity 
                style={styles.selectInput}
                onPress={() => setStateValue('showDestinationModal', true)}
              >
                <Text style={[
                  styles.selectText,
                  state.destinoPaquete.key === '-1' && styles.placeholderText
                ]}>
                  {state.destinoPaquete.label}
                </Text>
                <Icon name="chevron-down" type="material-community" color="#999" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Puntos de recogida</Text>
              <TouchableOpacity 
                style={styles.buttonOutlined}
                onPress={() => setStateValue('modalRecogida', true)}
              >
                <Text style={styles.buttonOutlinedText}>+ Añadir puntos de recogida</Text>
              </TouchableOpacity>
              
              {state.places.length > 0 && (
                <View style={styles.placesList}>
                  {state.places.map((punto, i) => (
                    <View key={i} style={styles.placeItem}>
                      <Text style={styles.placeText}>📍 {punto.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* SECCIÓN PAQUETE DIARIO CON CUPOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración del Paquete</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Paquete turístico diario</Text>
              <Switch
                trackColor={{false: '#767577', true: '#E2991C'}}
                thumbColor={state.paqueteDiario ? '#f4f3f4' : '#f4f3f4'}
                value={state.paqueteDiario}
                onValueChange={() => setStateValue('paqueteDiario', !state.paqueteDiario)}
              />
            </View>

            {state.paqueteDiario && (
              <View style={styles.paqueteDiarioSection}>
                <Text style={styles.inputLabel}>Repeticiones</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={state.configurationDay}
                    onValueChange={(itemValue) => {
                      setStateValue('configurationDay', itemValue);
                      // Lógica para configurar días según la selección
                      if (itemValue === 'everyDay') {
                        setState(prev => ({
                          ...prev,
                          lunes: true, martes: true, miercoles: true, jueves: true,
                          viernes: true, sabado: true, domingo: true,
                        }));
                      } else if (itemValue === 'sl') {
                        setState(prev => ({
                          ...prev,
                          lunes: true, martes: true, miercoles: true, jueves: true,
                          viernes: true, sabado: false, domingo: false,
                        }));
                      } else if (itemValue === 'fds') {
                        setState(prev => ({
                          ...prev,
                          lunes: false, martes: false, miercoles: false, jueves: false,
                          viernes: false, sabado: true, domingo: true,
                        }));
                      } else if (itemValue === 'configDay') {
                        setState(prev => ({
                          ...prev,
                          lunes: false, martes: false, miercoles: false, jueves: false,
                          viernes: false, sabado: false, domingo: false,
                        }));
                      }
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Seleccione" value="nothing" />
                    <Picker.Item label="Todos los días" value="everyDay" />
                    <Picker.Item label="Semana laboral" value="sl" />
                    <Picker.Item label="Fin de semana" value="fds" />
                    <Picker.Item label="Personalizado" value="configDay" />
                  </Picker>
                </View>

                {/* CONFIGURACIÓN DE DÍAS Y CUPOS */}
                {state.configurationDay && state.configurationDay !== 'nothing' && (
                  <View style={styles.cuposConfiguration}>
                    <Text style={styles.configurationTitle}>Cupos por día:</Text>
                    
                    {/* Para configuración personalizada */}
                    {state.configurationDay === 'configDay' && (
                      <View style={styles.diasConfig}>
                        {[
                          { key: 'lunes', label: 'Lunes', value: state.lunes },
                          { key: 'martes', label: 'Martes', value: state.martes },
                          { key: 'miercoles', label: 'Miércoles', value: state.miercoles },
                          { key: 'jueves', label: 'Jueves', value: state.jueves },
                          { key: 'viernes', label: 'Viernes', value: state.viernes },
                          { key: 'sabado', label: 'Sábado', value: state.sabado },
                          { key: 'domingo', label: 'Domingo', value: state.domingo },
                        ].map(dia => (
                          <View key={dia.key} style={styles.diaConfigRow}>
                            <View style={styles.diaSwitch}>
                              <Text style={styles.diaLabel}>{dia.label}</Text>
                              <Switch
                                value={dia.value}
                                onValueChange={() => setStateValue(dia.key as keyof typeof state, !dia.value)}
                              />
                            </View>
                            {dia.value && (
                              <View style={styles.cuposInputContainer}>
                                <Text style={styles.cuposLabel}>Cupos:</Text>
                                <TextInput
                                  style={styles.cuposInput}
                                  keyboardType="numeric"
                                  placeholder="0"
                                  placeholderTextColor="#999"
                                  value={state.cuposPorDiaConfig[dia.key as keyof CuposPorDiaConfig]?.toString() || '0'}
                                  onChangeText={(text) => handleCuposChange(dia.key, text)}
                                />
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Para configuraciones predefinidas */}
                    {state.configurationDay !== 'configDay' && (
                      <View style={styles.diasConfig}>
                        {getDiasSeleccionados().map(dia => (
                          <View key={dia} style={styles.diaConfigRow}>
                            <Text style={styles.diaLabel}>
                              {dia.charAt(0).toUpperCase() + dia.slice(1)}
                            </Text>
                            <View style={styles.cuposInputContainer}>
                              <Text style={styles.cuposLabel}>Cupos:</Text>
                              <TextInput
                                style={styles.cuposInput}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#999"
                                value={state.cuposPorDiaConfig[dia as keyof CuposPorDiaConfig]?.toString() || '0'}
                                onChangeText={(text) => handleCuposChange(dia, text)}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* CUPOS DISPONIBLES (solo si NO es paquete diario) */}
            {!state.paqueteDiario && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cupos disponibles totales</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ingresa el número total de cupos"
                  placeholderTextColor="#999"
                  value={state.cupos}
                  onChangeText={text => setStateValue('cupos', text)}
                />
              </View>
            )}
          </View>

          {/* SECCIÓN FECHAS Y HORAS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fechas y Horarios</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha inicio</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setStateValue('statusCalendar', true)}
                >
                  <Text style={styles.dateButtonText}>{state.startDate}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha fin</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setStateValue('statusCalendar', true)}
                >
                  <Text style={styles.dateButtonText}>{state.endDate}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>Hora salida</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={showDatePicker}
                >
                  <Text style={styles.timeButtonText}>
                    {state.infoHoraSalida || 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>Hora llegada</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={showDatePickerLlegada}
                >
                  <Text style={styles.timeButtonText}>
                    {state.infoHoraLlegada || 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* SECCIÓN ACOMODACIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acomodación</Text>
            
            <View style={styles.switchGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Doble</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#E2991C'}}
                  thumbColor={state.doble ? '#f4f3f4' : '#f4f3f4'}
                  value={state.doble}
                  onValueChange={() => setState(prev => ({
                    ...prev,
                    doble: !state.doble,
                    multiple: false,
                  }))}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Múltiple</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#E2991C'}}
                  thumbColor={state.multiple ? '#f4f3f4' : '#f4f3f4'}
                  value={state.multiple}
                  onValueChange={() => setState(prev => ({
                    ...prev,
                    multiple: !state.multiple,
                    doble: false,
                  }))}
                />
              </View>
            </View>
          </View>

          {/* SECCIÓN INFORMACIÓN ADICIONAL */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            
            <View style={styles.gridRow}>
              <View style={styles.gridInput}>
                <Text style={styles.inputLabel}>Días</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={state.dias}
                  onChangeText={text => setStateValue('dias', text)}
                />
              </View>
              
              <View style={styles.gridInput}>
                <Text style={styles.inputLabel}>Noches</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={state.noches}
                  onChangeText={text => setStateValue('noches', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del guía</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nombre completo del guía"
                placeholderTextColor="#999"
                value={state.nombreGuia}
                onChangeText={text => setStateValue('nombreGuia', text)}
              />
            </View>
          </View>

          {/* SECCIÓN PRECIOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precios</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio adulto</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.textInput, styles.priceTextInput]}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={state.precio.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  onChangeText={text => setStateValue('precio', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio niño</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.textInput, styles.priceTextInput]}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={state.precioNino.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  onChangeText={text => setStateValue('precioNino', text)}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Incluir descuento</Text>
              <Switch
                trackColor={{false: '#767577', true: '#E2991C'}}
                thumbColor={state.desc ? '#f4f3f4' : '#f4f3f4'}
                value={state.desc}
                onValueChange={() => setStateValue('desc', !state.desc)}
              />
            </View>

            {state.desc && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Precio con descuento</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[styles.textInput, styles.priceTextInput]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={state.precioDcto.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    onChangeText={text => setStateValue('precioDcto', text)}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECCIÓN IMÁGENES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imágenes</Text>
            
            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Imagen principal</Text>
              <TouchableOpacity 
                style={styles.imageUpload}
                onPress={() => chooseImage('principal', 1)}
              >
                {state.imgPrincipal ? (
                  <Image
                    source={{uri: state.imgPrincipal.file}}
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
                onPress={() => chooseImage('banner', 1)}
              >
                {state.imgBanner ? (
                  <Image
                    source={{uri: state.imgBanner.file}}
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

            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Galería de imágenes</Text>
              <TouchableOpacity 
                style={styles.imageUpload}
                onPress={() => chooseImage('gallery', 5)}
              >
                <View style={styles.galleryPlaceholder}>
                  <Icon name="image-multiple" type="material-community" color="#999" size={30} />
                  <Text style={styles.imagePlaceholderText}>
                    {state.imgGallery.length > 0 ? 
                      `${state.imgGallery.length} imágenes` : 
                      'Agregar imágenes'
                    }
                  </Text>
                </View>
              </TouchableOpacity>
              
              {state.imgGallery.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                  {state.imgGallery.map((item, index) => (
                    <Image
                      key={index.toString()}
                      source={{ uri: item.file }}
                      style={styles.galleryImage}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* BOTÓN CREAR */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={onHandleSubmit}
          >
            <Text style={styles.createButtonText}>Crear Paquete Turístico</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAwareScrollView>

      {/* MODAL DE DESTINOS */}
      <Modal
        visible={state.showDestinationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.destinationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Destino</Text>
              <TouchableOpacity 
                onPress={() => setStateValue('showDestinationModal', false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.destinosList}>
              {state.destinos.map((destino) => (
                <TouchableOpacity
                  key={destino.key}
                  style={[
                    styles.destinoItem,
                    state.destinoPaquete.key === destino.key && styles.destinoItemSelected
                  ]}
                  onPress={() => {
                    setState(prev => ({
                      ...prev,
                      destinoPaquete: destino,
                      destino: destino.key,
                      showDestinationModal: false
                    }));
                  }}
                >
                  <Text style={[
                    styles.destinoText,
                    state.destinoPaquete.key === destino.key && styles.destinoTextSelected
                  ]}>
                    {destino.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODALES EXISTENTES */}
      <DateTimePickerModal
        isVisible={state.DatePickerVisibility}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        locale='es_CO'
      />
      
      <DateTimePickerModal
        isVisible={state.DatePickerVisibleLlegada}
        mode="time"
        onConfirm={handleConfirmLlegada}
        onCancel={hideDatePickerLlegada}
        locale='es_CO'
      />

      {state.statusCalendar && (
        <Overlay
          isVisible={state.statusCalendar}
          windowBackgroundColor="rgba(0, 0, 0, 0.7)"
          overlayStyle={styles.calendarOverlay}
        >
          <Calendar
            minDate={Date()}
            monthFormat={'MMMM yyyy'}
            markedDates={state.markedDates}
            markingType="period"
            hideExtraDays={true}
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
              onPress={() => setStateValue('statusCalendar', false)}
            >
              <Text style={styles.calendarButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.calendarButton, styles.confirmButton]}
              onPress={() => setStateValue('statusCalendar', false)}
            >
              <Text style={styles.calendarButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </Overlay>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={state.modalRecogida || state.modalPuntoFnal}
        onRequestClose={() => setStateValue('modalRecogida', false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setStateValue('modalRecogida', false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            {state.modalRecogida && (
              <GooglePlacesComponent
                savePlaces={savePlaces}
                cantElements={3}
                closeModal={closeModal}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

// ESTILOS MEJORADOS CON LAS CORRECCIONES
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    alignItems: 'center',
    flex: 1,
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
    marginBottom: 8,
  },
  transportDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#404040',
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
  // NUEVOS ESTILOS PARA PAQUETE DIARIO Y CUPOS
  paqueteDiarioSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  pickerContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 16,
  },
  picker: {
    color: '#fff',
  },
  cuposConfiguration: {
    marginTop: 16,
  },
  configurationTitle: {
    color: '#E2991C',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  diasConfig: {
    marginTop: 8,
  },
  diaConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  diaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  diaLabel: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
    flex: 1,
  },
  cuposInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  cuposLabel: {
    color: '#fff',
    fontSize: 12,
    marginRight: 8,
  },
  cuposInput: {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#555',
    width: 60,
    textAlign: 'center',
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
  // NUEVOS ESTILOS PARA MODAL DE DESTINOS
  destinationModal: {
    backgroundColor: '#2d2d2d',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  destinosList: {
    maxHeight: 400,
  },
  destinoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  destinoItemSelected: {
    backgroundColor: '#E2991C',
  },
  destinoText: {
    color: '#fff',
    fontSize: 16,
  },
  destinoTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
    padding: 8,
  },
  modalCloseText: {
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
});

export default CreateTourisms;