import React, { Component } from "react";
import { Header } from "react-native-elements";
import { connect } from "react-redux";
import Notification from "../Notifications";
import ModalSelector from "react-native-modal-selector";
import { KeyboardAwareScrollView } from "@codler/react-native-keyboard-aware-scroll-view";
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

import CreateProgrammingServices from "../../services/ChatServices";

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

interface SessionState {
  user: User;
}

interface NavPagesState {
  navPages: NavPages;
}

interface RootState {
  session: SessionState;
  navPages: NavPagesState;
}

interface ProgrammingFormProps {
  user: User;
  navPages: NavPages;
}

interface ProgrammingFormState {
  // Define el estado del componente aquí si es necesario
}

class ProgrammingForm extends Component<ProgrammingFormProps, ProgrammingFormState> {
  constructor(props: ProgrammingFormProps) {
    super(props);
    // Inicializa el estado si es necesario
    this.state = {
      // estado inicial
    };
  }

  render() {
    // Render del componente
    return (
      <View>
        {/* Contenido del componente */}
        <Text>Programming Form Component</Text>
      </View>
    );
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

export default connect(mapStateToProps)(ProgrammingForm);