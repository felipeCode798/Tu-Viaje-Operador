import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { imageUrl, clientUrl } from "../constants/Urls";

interface Passenger {
  _id: string;
  cel: string;
  email: string;
  lastnames: string;
  names: string;
  numberId: string;
  phone: string;
  selectId: string;
  selectOrigen: string;
}

interface ServiceResult {
  id: string;
  passenger: {
    id: string;
    names: string;
    profile: string;
    phone: string;
  };
}

interface Message {
  id: string;
  msg: string;
  user: string;
  createdAt: string;
}

interface SendMessageResponse {
  status: string;
}

interface ServicesResponse {
  getServicesByProgramming: {
    result: ServiceResult[] | null;
    message: string;
  };
}

interface MessagesResponse {
  getMsgChat: Message[] | null;
}

interface SendMessageMutationResponse {
  sendMsgChat: SendMessageResponse;
}

export default class ChatServices {
  static getPassengers(id: string, type: string): Promise<Passenger[]> {
    console.log({
      id,
      type,
    });
    const client = new ApolloClient({
      uri: clientUrl,
    });
    
    return new Promise((resolve, reject) => {
      client
        .query({
          query: gql`
          {
            getPassengersBy${type}(id: "${id}") {
              _id
              cel
              email
              lastnames
              names
              numberId
              phone
              selectId
              selectOrigen
            }
          }
        `,
        })
        .then((result) => {
          console.log(result.data);
          const key = `getPassengersBy${type}` as keyof typeof result.data;
          resolve(result.data[key] as Passenger[]);
        })
        .catch((err) => {
          console.log(err);
          resolve([]);
        });
    });
  }

  static getSerivesForProgramming(idProgramming: string): Promise<ServiceResult[]> {
    console.log("ide programin", idProgramming);
    const client = new ApolloClient({
      uri: clientUrl,
    });
    
    return new Promise((resolve, reject) => {
      client
        .query({
          query: gql`
            query {
                getServicesByProgramming(programmingId:"${idProgramming.toString()}"){
                    result{
                      id
                      passenger{
                        id
                        names
                        profile
                        phone
                      }
                    }
                    message
                  }
                }`,
        })
        .then((result) => {
          const data = result.data as ServicesResponse;
          if (data.getServicesByProgramming.result !== null) {
            resolve(data.getServicesByProgramming.result);
          } else {
            reject(data.getServicesByProgramming.message);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getHistoryChat(idService: string): Promise<Message[]> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    
    return new Promise((resolve, reject) => {
      client
        .query({
          query: gql`
            query {
              getMsgChat(serviceId:"${idService.toString()}"){
                id
                msg
                user
                createdAt
              }
            }`,
        })
        .then((result) => {
          const data = result.data as MessagesResponse;
          if (data.getMsgChat !== null) {
            resolve(data.getMsgChat);
          } else {
            reject("HAY UN ERROR");
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  static sendMessage(idService: string, typeUser: string, message: string): Promise<SendMessageResponse> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    
    return new Promise((resolve, reject) => {
      client
        .mutate({
          mutation: gql`
            mutation sendMsg($input: messagesChatInput) {
              sendMsgChat(input: $input) {
                status
              }
            }
          `,
          variables: {
            input: {
              msg: message,
              user: typeUser, //"DRIVER"
              serviceId: idService,
            },
          },
        })
        .then((result) => {
          const data = result.data as SendMessageMutationResponse;
          if (data.sendMsgChat !== null) {
            resolve(data.sendMsgChat);
          } else {
            reject("HAY UN ERROR");
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }
}