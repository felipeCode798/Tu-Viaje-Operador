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

      if (result.data.getServicesByProgramming?.result !== null) {
        return result.data.getServicesByProgramming.result;
      } else {
        throw new Error(result.data.getServicesByProgramming.message);
      }
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

      if (result.data.getMsgChat !== null) {
        return result.data.getMsgChat;
      } else {
        throw new Error("HAY UN ERROR");
      }
    } catch (error) {
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
            user: typeUser,
            serviceId: idService,
          },
        },
      });

      if (result.data.sendMsgChat !== null) {
        return result.data.sendMsgChat;
      } else {
        throw new Error("HAY UN ERROR");
      }
    } catch (error) {
      console.log(error);
      return { status: false, message: 'Error sending message' };
    }
  }
}