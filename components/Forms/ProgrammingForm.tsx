import React, { Component } from "react";
import { Header } from "react-native-elements";
import { connect } from "react-redux";
import Notification from "../Notifications";
import ModalSelector from "react-native-modal-selector";
import {
  View,
  Text,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Switch,
  TextInput,
} from "react-native";

const { height, width } = Dimensions.get("window");

import CreateProgrammingServices from "../../services/CreateProgrammingServices";

// Interfaces para el estado de Redux
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

interface ProgrammingFormProps {
  user: User;
  navPages: NavPages;
}

interface ProgrammingFormState {
  // Aquí definirías el estado del componente según sea necesario
}

class ProgrammingForm extends Component<ProgrammingFormProps, ProgrammingFormState> {
  // Implementación del componente...
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

export default connect(mapStateToProps)(ProgrammingForm);