import React, { Component } from "react";
import { Dimensions, Text, View, StyleSheet, Platform } from "react-native";
import ButtonFilter from "./ButtonFlter";

const { height, width } = Dimensions.get("window");

interface Filter {
  type: string;
  status: string;
}

interface FilterComponentProps {
  callBack: (filter: Filter) => void;
  resetFilter: boolean;
  changeResetFilter: () => void;
  changeReset: () => void;
}

interface FilterComponentState {
  filter: Filter;
}

const initialFilter: Filter = {
  type: "Todos",
  status: "todos",
};

export default class FilterComponent extends Component<FilterComponentProps, FilterComponentState> {
  constructor(props: FilterComponentProps) {
    super(props);
    this.state = {
      filter: initialFilter,
    };
  }

  componentDidUpdate(prevProps: FilterComponentProps) {
    if (this.props.resetFilter && !prevProps.resetFilter) {
      this.setState({ filter: initialFilter });
      this.props.changeResetFilter();
    }
  }

  handleFilterType = (prop: string) => {
    this.setState({ filter: { ...this.state.filter, type: prop } });
    this.props.callBack({ ...this.state.filter, type: prop });
    this.props.changeReset();
  };

  handleFilterStatus = (prop: string) => {
    this.setState({ filter: { ...this.state.filter, status: prop } });
    this.props.callBack({ ...this.state.filter, status: prop });
    this.props.changeReset();
  };

  render() {
    const tipos = ["Todos", "Viajes", "Turismos"];
    const options = ["Todos", "Pendientes", "Iniciado", "Finalizado", "Cancelado"];

    return (
      <View style={styles.container}>
        <View style={styles.filterButtonGroup}>
          {tipos.map((item, i) => (
            <Text
              onPress={() => this.handleFilterType(item)}
              key={i}
              style={[
                styles.filterButton,
                styles.textCenter,
                this.state.filter.type === item && styles.active,
              ]}
            >
              {item}
            </Text>
          ))}
        </View>
        <View style={styles.optionsGroup}>
          {options.map((option, i) => {
            return (
              <ButtonFilter
                key={i}
                text={option}
                color={option.toLowerCase()}
                action={this.handleFilterStatus}
                activeItemStatus={this.state.filter.status === option.toLowerCase()}
              />
            );
          })}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  filterButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: height * 0.03,
    marginBottom: height * 0.02,
  },
  optionsGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: height * 0.05,
    borderRadius: Platform.OS === 'ios' ? height * 0.02 : height * 0.05,
    height: Platform.OS === 'ios' ? height * 0.02 : height * 0.07,
  },
  filterButton: {
    fontSize: height * 0.021,
    height: height * 0.04,
    width: width * 0.24,
    alignItems: "center",
    color: "#fff",
    fontWeight: "bold",
    paddingHorizontal: height * 0.01,
    backgroundColor: "#2F2F2F",
    borderRadius: Platform.OS === 'ios' ? height * 0.02 : height * 0.05,
    overflow: 'hidden',
  },
  textCenter: {
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    lineHeight: height * 0.04,
  },
  active: {
    borderWidth: 1.5,
    borderColor: "#E2991C",
  },
});