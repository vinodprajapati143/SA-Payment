export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    registerType: any;
    id: number;
    username: string;
    phone: string;
    countryCode: string;
    phonetype: string;
    logintype: string;
    language: string;
    random: string;
    signature: string;
    timestamp: number;
  };
}
