export class CustomError implements Error {
  name: string;
  message: string;
  code: number;
  data: any;
  constructor(message: string, statusCode: number, data: any) {
    this.message = message;
    this.name = "CustomError";
    this.code = statusCode;
    this.data = data;
  }
}

export interface Game {
  status: string;
patte2: any;
patte2_close: any;
patte1_open: any;
patte1: any;
  closeTimerStarted: boolean;
  closeTime: number;
  closeWindowStart: number;
  closeInputEnabled: boolean;
  openInputEnabled: boolean;
  openTimerStarted: boolean;
  openTime: number;
  openWindowStart: number;
  submitted: any;
  closeCountdown: number;
  openCountdown: number;
  id: number;
  game_name: string;
  open_time: string;
  close_time: string;
}

export interface gamebyid {
  id?: string;
  game_name: string;
  open_time: string;
  close_time: string;
  days: string[];      // Adjust type as per your needs
  prices: any;         // Adjust type as needed
}

export interface JodiRecord {
  input_date: string;
  jodi_value: string;
}

export interface JodiResponse {
  game_name: string;
  result: string;           // Overall result string, e.g. "568-91-227"
  records: JodiRecord[];    // Array of daily jodi records
}

export interface PanelRecord {
  input_date: string;           // Date in 'YYYY-MM-DD' format
  panelLeft: string[];          // Array of digits as strings, e.g. ["2","8","8"]
  jodi: string;                 // Combined string e.g. "84"
  panelRight: string[];         // Array of digits as strings e.g. ["3","7","4"]
  resultString: string;         // Result string e.g. "134-84-374"
}

export interface PanelResponse {
  game_name: string;            // Name of the game
  latestResultString: string;   // Latest overall result string
  records: PanelRecord[];       // Array of PanelRecord objects
}

export interface UserGame {
  id: number;
  name: string;
  date: string;
  day: string;
  timing: string;
  result: string;
  status: string;
    open_time: string;
  close_time: string;
}