import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { clientUrl } from '../constants/Urls';

export interface Passenger {
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

export interface Service {
  id: string;
  passenger: {
    id: string;
    names: string;
    profile: string;
    phone: string;
  };
}

export interface Message {
  id: string;
  msg: string;
  user: string;
  createdAt: string;
}

export interface ResponseStatus {
  status: boolean;
  message?: string;
}

const createApolloClient = () => {
  return new ApolloClient({
    uri: clientUrl,
    cache: new InMemoryCache(),
  });
};

export default class ChatServices {
  static async getPassengers(id: string, type: string): Promise<Passenger[]> {
    console.log({ id, type });
    
    const client = createApolloClient();
    
    try {
      const result = await client.query({
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
      });

      const dataKey = `getPassengersBy${type}` as keyof typeof result.data;
      return result.data[dataKey] || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  static async getServicesForProgramming(idProgramming: string): Promise<Service[]> {
    console.log("ide programin", idProgramming);
    
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query {
            getServicesByProgramming(programmingId:"${idProgramming.toString()}"){
              result {
                id
                passenger {
                  id
                  names
                  profile
                  phone
                }
              }
              message
            }
          }
        `,
      });

      return result.data.getServicesByProgramming?.result || [];
    } catch (error) {
      console.log(error);
      throw new Error('Error fetching services for programming');
    }
  }

  static async getHistoryChat(idService: string): Promise<Message[]> {
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query {
            getMsgChat(serviceId:"${idService.toString()}"){
              id
              msg
              user
              createdAt
            }
          }
        `,
      });

      return result.data.getMsgChat || [];
    } catch (error) {
      console.log(error);
      throw new Error('Error fetching chat history');
    }
  }

  static async sendMessage(idService: string, typeUser: string, message: string): Promise<ResponseStatus> {
    const client = createApolloClient();
    
    try {
      const result = await client.mutate({
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
            user: typeUser, // "DRIVER"
            serviceId: idService,
          },
        },
      });

      return result.data.sendMsgChat || { status: false };
    } catch (error) {
      console.log(error);
      return { status: false, message: 'Error sending message' };
    }
  }
}