import { KeyboardAwareScrollView } from "@codler/react-native-keyboard-aware-scroll-view";
import TimeInput from '@tighten/react-native-time-input';
import moment from "moment";
import { Component } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Header, Icon, Overlay } from "react-native-elements";
import ModalSelector, { ModalSelectorOption } from "react-native-modal-selector";
import { connect } from "react-redux";
import CreateTurismoServices from "../../../../tuviaje/Cliente/Movil/Hibrida/tu-viaje-operador/services/CreateTurismoServices";
import Notification from "../Notifications";

const { height, width } = Dimensions.get("window");

// Interfaces para tipos
interface User {
  idUser: number;
  photo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
}

interface NavPages {
  current: string;
  previous: string;
}

interface RootState {
  session: {
    user: User;
  };
  navPages: {
    navPages: NavPages;
  };
}

interface TurismoFormProps {
  user: User;
  navPages: NavPages;
}

interface Destination {
  id: number;
  key: string | number; // Acepta ambos tipos
  name: string;
  label: string;
}

interface FetchData {
  fechaInicio: string;
  fechaFin: string;
}

interface MarkedDates {
  [key: string]: {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
  };
}

interface TurismoFormState {
  user: number;
  vehiculo: boolean;
  avion: boolean;
  alimentacion: boolean;
  tiquetes: boolean;
  hospedaje: boolean;
  markedDates: MarkedDates;
  traslados: boolean;
  entradas: boolean;
  statusCalendar: boolean;
  fetchData: FetchData;
  timeIda: string;
  timeVuelta: string;
  startDate: string;
  endDate: string;
  isStartDatePicked: boolean;
  isEndDatePicked: boolean;
  destinoPaquete: {
    key: string;
    label: string;
  };
  destinos: Destination[];
}

class TurismoForm extends Component<TurismoFormProps, TurismoFormState> {
    constructor(props: TurismoFormProps) {
        super(props);
        this.state = {
            user: this.props.user.idUser,
            vehiculo: false,
            avion: false,
            alimentacion: false,
            tiquetes: false,
            hospedaje: false,
            markedDates: {},
            traslados: false,
            entradas: false,
            statusCalendar: false,
            fetchData: {
                fechaInicio: "",
                fechaFin: ""
            },
            timeIda: "",
            timeVuelta: "",
            startDate: moment(Date()).format("YYYY-MM-DD"),
            endDate: moment(Date()).format("YYYY-MM-DD"),
            isStartDatePicked: false,
            isEndDatePicked: false,
            destinoPaquete: {
                key: "-1",
                label: "Debe seleccionar un destino"
            },
            destinos: [],
        }
    }

    onDayPress = (day: any) => {
        if (
            this.state.isStartDatePicked == false ||
            moment(day.dateString) < moment(this.state.startDate)
        ) {
            let markedDates: MarkedDates = {};
            markedDates[day.dateString] = {
                startingDay: true,
                color: "orange",
                textColor: "#FFFFFF",
            };
            let fetchData = {...this.state.fetchData};
            fetchData.fechaInicio = day.dateString;
            fetchData.fechaFin = day.dateString;
            this.setState({
                markedDates: markedDates,
                isStartDatePicked: true,
                isEndDatePicked: false,
                fetchData: fetchData,
                startDate: day.dateString,
                endDate: day.dateString,
            });
        } else {
            let markedDates = {...this.state.markedDates};
            let startDate = moment(this.state.startDate);
            let endDate1 = moment(day.dateString);
            let range = endDate1.diff(startDate, "days");
            let fetchData = {...this.state.fetchData};
            fetchData.fechaFin = day.dateString;
            this.setState({
                endDate: day.dateString,
                fetchData: fetchData,
            });
            if (range > 0) {
                for (let i = 1; i <= range; i++) {
                    let tempDate = startDate.add(1, "day");
                    let tempDateStr = moment(tempDate).format("YYYY-MM-DD");
                    if (i < range) {
                        markedDates[tempDateStr] = { color: "orange", textColor: "#FFFFFF" };
                    } else {
                        markedDates[tempDateStr] = {
                            endingDay: true,
                            color: "orange",
                            textColor: "#FFFFFF",
                        };
                    }
                }
                this.setState({
                    markedDates: markedDates,
                    isStartDatePicked: false,
                    isEndDatePicked: true,
                });
            }
        }
    };

    componentDidMount() {
        this.getDestinations();
    }

    getDestinations() {
        CreateTurismoServices
            .getDestinationsWithoutPaginate(this.state.user)
            .then((data: any[]) => {
                const destinations: Destination[] = data.map((destination) => ({
                    ...destination,
                    key: destination.id.toString(), // Convertir a string
                    label: destination.name,
                }));
                this.setState({ destinos: destinations });
            })
            .catch((e: Error) => {
                console.log(e);
            });
    }

    render() {
        return (
            <View>
                <StatusBar barStyle={"light-content"} />
                <Notification />
                <Header
                    centerComponent={{
                        text: "Crear Paquete Turismo",
                        style: {
                            width: width,
                            textAlign: "center",
                            color: "#fff",
                            fontSize: 30,
                            top: -12,
                        },
                    }}
                    containerStyle={{
                        backgroundColor: "black",
                        borderBottomWidth: 0,
                    }}
                />
                <KeyboardAwareScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
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
                                />
                            </View>
                            <View>
                                <Text style={[styles.textLabel, styles.texColorWite]}>
                                    Tipo de transporte
                                </Text>
                                <View style={styles.checkboxContainer}>
                                    <Text style={[styles.label, styles.texColorWite]}>vehículo</Text>
                                    <Switch
                                        style={styles.switch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.vehiculo}
                                        onValueChange={() => this.setState({ vehiculo: !this.state.vehiculo, avion: false })}
                                    />
                                    <Text style={[styles.label, styles.texColorWite]}>Avion</Text>
                                    <Switch
                                        style={styles.switch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.avion}
                                        onValueChange={() => this.setState({ avion: !this.state.avion, vehiculo: false })}
                                    />
                                </View>
                                {this.state.vehiculo && (
                                    <View style={{ paddingTop: Platform.OS === 'ios' ? height * 0.02 : height * 0.03 }}>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Marca del vehículo
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textInput]}
                                            keyboardType="default"
                                            placeholder="Marca del vehículo"
                                            placeholderTextColor="gray"
                                            autoCapitalize="none"
                                        />
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Placa del vehículo
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textInput]}
                                            keyboardType="default"
                                            placeholder="Placa del vehículo"
                                            placeholderTextColor="gray"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                )}
                                {this.state.avion && (
                                    <View style={{ paddingTop: Platform.OS === 'ios' ? height * 0.02 : height * 0.03 }}>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Nombre de la aerolinea
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textInput]}
                                            keyboardType="default"
                                            placeholder="Nombre de la aerolinea"
                                            placeholderTextColor="gray"
                                            autoCapitalize="none"
                                        />
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Numero de vuelo
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textInput]}
                                            keyboardType="default"
                                            placeholder="Numero de vuelo"
                                            placeholderTextColor="gray"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                )}
                                <View style={{ paddingTop: Platform.OS === 'ios' ? height * 0.015 : height * 0.025 }}>
                                    <Text style={[styles.textLabel, styles.texColorWite]}>
                                        Descripción general del paquete turistico
                                    </Text>
                                    <TextInput
                                        style={[styles.texColorWite, styles.textDes]}
                                        keyboardType="default"
                                        numberOfLines={5}
                                        multiline={true}
                                        autoCapitalize="none"
                                        placeholder="Descripcion general del paquete turistico"
                                        placeholderTextColor="gray"
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.label, styles.texColorWite]}>Incluye alimentacion</Text>
                                    <Switch
                                        style={styles.containerSwitch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.alimentacion}
                                        onValueChange={() => this.setState({ alimentacion: !this.state.alimentacion })}
                                    />
                                </View>
                                {this.state.alimentacion && (
                                    <View>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Descripcion sobre alimentacion
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textDes]}
                                            keyboardType="default"
                                            numberOfLines={5}
                                            multiline={true}
                                            autoCapitalize="none"
                                            placeholder="Descripcion sobre alimentacion"
                                            placeholderTextColor="gray"
                                        />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.label, styles.texColorWite]}>Incluye tiquetes o pasajes</Text>
                                    <Switch
                                        style={styles.containerSwitch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.tiquetes}
                                        onValueChange={() => this.setState({ tiquetes: !this.state.tiquetes })}
                                    />
                                </View>
                                {this.state.tiquetes && (
                                    <View>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Descripcion sobre tiquetes o pasajes
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textDes]}
                                            keyboardType="default"
                                            numberOfLines={5}
                                            multiline={true}
                                            autoCapitalize="none"
                                            placeholder="Descripcion sobre tiquetes o pasajes"
                                            placeholderTextColor="gray"
                                        />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.label, styles.texColorWite]}>Incluye hospedaje</Text>
                                    <Switch
                                        style={styles.containerSwitch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.hospedaje}
                                        onValueChange={() => this.setState({ hospedaje: !this.state.hospedaje })}
                                    />
                                </View>
                                {this.state.hospedaje && (
                                    <View>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Descripcion sobre los hospedaje
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textDes]}
                                            keyboardType="default"
                                            numberOfLines={5}
                                            multiline={true}
                                            autoCapitalize="none"
                                            placeholder="Descripcion sobre hospedaje"
                                            placeholderTextColor="gray"
                                        />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.label, styles.texColorWite]}>Incluye traslados</Text>
                                    <Switch
                                        style={styles.containerSwitch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.traslados}
                                        onValueChange={() => this.setState({ traslados: !this.state.traslados })}
                                    />
                                </View>
                                {this.state.traslados && (
                                    <View>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Descripcion sobre los traslados
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textDes]}
                                            keyboardType="default"
                                            numberOfLines={5}
                                            multiline={true}
                                            autoCapitalize="none"
                                            placeholder="Descripcion sobre los traslados"
                                            placeholderTextColor="gray"
                                        />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.label, styles.texColorWite]}>Incluye entradas turisticas</Text>
                                    <Switch
                                        style={styles.containerSwitch}
                                        trackColor={{ false: "#767577", true: "#E2770D" }} // Agregado #
                                        value={this.state.entradas}
                                        onValueChange={() => this.setState({ entradas: !this.state.entradas })}
                                    />
                                </View>
                                {this.state.entradas && (
                                    <View>
                                        <Text style={[styles.textLabel, styles.texColorWite]}>
                                            Descripcion sobre las entradas turisticas
                                        </Text>
                                        <TextInput
                                            style={[styles.texColorWite, styles.textDes]}
                                            keyboardType="default"
                                            numberOfLines={5}
                                            multiline={true}
                                            autoCapitalize="none"
                                            placeholder="Descripcion sobre las entradas turisticas"
                                            placeholderTextColor="gray"
                                        />
                                    </View>
                                )}

                                <View style={{ paddingTop: Platform.OS === 'ios' ? height * 0.015 : height * 0.025, marginBottom: Platform.OS === 'ios' ? height * 0.004 : height * 0.01 }}>
                                    <Text style={[styles.textLabel, styles.texColorWite]}>
                                        Destino del paquete turistico
                                    </Text>
                                    <ModalSelector
                                    data={this.state.destinos}
                                    onChange={(option: ModalSelectorOption) => {
                                        this.setState({
                                            destinoPaquete: {
                                                key: option.key.toString(), // Convertir a string
                                                label: option.label,
                                            },
                                        });
                                    }}
                                    initValue="Seleccionar destino"
                                    scrollViewAccessibilityLabel={"Scrollable options"}
                                    cancelText={"Cancelar"}
                                    optionTextStyle={{ color: "black" }}
                                    optionContainerStyle={{
                                        backgroundColor: "white",
                                        opacity: 1,
                                    }}
                                >
                                        <Text style={[styles.textSelect, styles.texColorWite]}>
                                            {this.state.destinoPaquete.label}
                                        </Text>
                                    </ModalSelector>
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
                                        onPress={() => this.setState({ statusCalendar: true })}
                                    >
                                        <View style={styles.textWithIcon}>
                                            <Icon
                                                name="calendar"
                                                size={25}
                                                color="orange"
                                                type="material-community"
                                            />
                                            <Text style={styles.inputText}>
                                                {this.state.startDate}
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
                                        onPress={() => this.setState({ statusCalendar: true })}
                                    >
                                        <View style={styles.textWithIcon}>
                                            <Icon
                                                name="calendar"
                                                size={25}
                                                color="orange"
                                                type="material-community"
                                            />
                                            <Text style={styles.inputText}>
                                                {this.state.endDate}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                {this.state.statusCalendar && (
                                    <Overlay
                                        isVisible={this.state.statusCalendar}
                                        overlayStyle={[
                                            { 
                                            width: width * 0.9, 
                                            height: 440,
                                            backgroundColor: "rgba(41, 41, 41, 0.7)" 
                                            }
                                        ]}
                                    >
                                        <View>
                                            <Calendar
                                                minDate={Date().toString()}
                                                monthFormat={"MMMM yyyy"}
                                                markedDates={this.state.markedDates}
                                                markingType="period"
                                                hideExtraDays={true}
                                                hideDayNames={true}
                                                onDayPress={this.onDayPress}
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
                                                    style={{ ...styles.Botton, backgroundColor: "#000", width: "47%" }}
                                                    onPress={() => {
                                                        this.setState({
                                                            statusCalendar: false,
                                                            startDate: moment(Date()).format("YYYY-MM-DD"),
                                                            endDate: moment(Date()).format("YYYY-MM-DD"),
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.buttonText}>Cancelar</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={{ ...styles.button, width: "47%" }}
                                                    onPress={() => {
                                                        this.setState({ statusCalendar: false });
                                                    }}
                                                >
                                                    <Text style={styles.buttonText}>Aceptar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Overlay>
                                )}
                                <Text style={[styles.textLabel, styles.texColorWite]}>
                                    Hora de salida
                                </Text>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        paddingTop: Platform.OS === "ios" ? height * 0.01 : height * 0.015,
                                    }}
                                >
                                    <TimeInput
                                        setCurrentTime
                                        onTimeChange={(time: string) => console.log('cambio la fecha', time)}
                                        theme={{
                                            inputBackgroundColor: '#000000',
                                            inputTextColor: 'white',
                                        }}
                                        styles={{
                                            componentContainer: {
                                                borderStyle: 'solid',
                                                borderWidth: 1,
                                                paddingHorizontal: 0,
                                            },
                                        }}
                                    />
                                </View>
                                <Text style={[styles.textLabel, styles.texColorWite]}>
                                    Hora de llegada
                                </Text>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        paddingTop: Platform.OS === "ios" ? height * 0.01 : height * 0.015,
                                    }}
                                >
                                    <TimeInput
                                        setCurrentTime
                                        onTimeChange={(time: string) => console.log(time)}
                                        theme={{
                                            inputBackgroundColor: '#000000',
                                            inputTextColor: 'white',
                                        }}
                                        styles={{
                                            componentContainer: {
                                                borderStyle: 'solid',
                                                borderWidth: 1,
                                                paddingHorizontal: 0,
                                            },
                                        }}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        )
    }
}

const mapStateToProps = (state: RootState) => {
    const { navPages } = state.navPages;
    const { user } = state.session;
    return {
        user: {
            idUser: user.idUser,
            photo: user.photo,
            nombres: user.nombres,
            apellidos: user.apellidos,
            telefono: user.telefono,
            email: user.email,
            password: user.password,
        },
        navPages: {
            current: navPages.current,
            previous: navPages.previous,
        },
    };
};

export default connect(mapStateToProps)(TurismoForm);

const styles = StyleSheet.create({
    container: {
        height: height,
        width: width,
        padding: 25,
        marginBottom: 100,
        backgroundColor: "black",
    },
    textLabel: {
        fontSize: Platform.OS === "ios" ? height * 0.024 : height * 0.028,
        marginTop: Platform.OS === "ios" ? height * 0.01 : height * 0.02,
        marginBottom: Platform.OS === "ios" ? height * 0.01 : height * 0.03,
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
    inputContainer: {
        flexDirection: "row",
        marginVertical: 0,
    },
    textInput: {
        fontSize: Platform.OS === "ios" ? height * 0.015 : height * 0.013,
        marginVertical: 7,
        paddingVertical: 7,
        textAlign: "center",
        borderColor: "white",
        lineHeight: Platform.OS === "ios" ? height * 0.02 : height * 0.05,
        borderWidth: width * 0.005,
        borderRadius: height * 0.05,
    },
    textDes: {
        fontSize: Platform.OS === "ios" ? height * 0.015 : height * 0.013,
        marginVertical: 7,
        paddingVertical: 7,
        textAlign: "center",
        borderColor: "white",
        lineHeight: Platform.OS === "ios" ? height * 0.02 : height * 0.05,
        borderWidth: width * 0.005,
        borderRadius: height * 0.01,
    },
    containerSwitch: {
        marginVertical: 5,
        flexDirection: "row",
        flex: 1,
    },
    textSwitch: {
        width: width * 0.4,
    },
    switch: {
        width: width * 0.4,
        top: Platform.OS === "ios" ? height * 0.02 : height * 0.4
    },
    disable: {
        borderColor: "red",
        color: "red",
    },
    texColorWite: {
        color: "white",
    },
    checkboxContainer: {
        flexDirection: "row",
        marginBottom: 20,
        borderRadius: 100
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 3,
        top: Platform.OS === "ios" ? height * 0.025 : height * 0.01,
    },
    Botton: {
        backgroundColor: "orange",
        borderRadius: 20,
        width: 325,
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    textClose: {
        lineHeight: Platform.OS === "ios" ? width * 0.09 : width * 0.076,
    },
    btnDates: {
        alignItems: "center",
        flexDirection: "row",
        alignContent: "center",
    },
    button: {
        backgroundColor: "orange",
        borderRadius: 20,
        width: 325,
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    MainContainer: {
        flex: 1,
        padding: 6,
        alignItems: 'center',
        backgroundColor: 'white'
    },
    text: {
        fontSize: Platform.OS === "ios" ? height * 0.015 : height * 0.02,
        color: 'black',
        padding: 3,
        marginBottom: 10,
        textAlign: 'center'
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 15,
        width: width * 0.35,
        height: width * 0.123,
    },
    inputText: {
        fontSize: 16,
        color: 'black',
        marginLeft: 10,
    },
    textWithIcon: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 15,
    },
});