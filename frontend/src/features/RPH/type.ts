export interface RPH {
  _id?: string;
  subject: string;
  level: string;
  topic: string;
  standardKandungan: string;
  standardPembelajaran: string;
  objectives: string;
  
  kriteriaKejayaan?: string;  
  emk?: string;                
  bbm?: string;                 
  pbd?: string;
  
  date: string;
  duration: string;
  minggu?: string;

  // AI generated result
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;

  refleksi?: string;
  userId: string;
  createdAt?: string;
}

export interface RPHRequest {
  subject: string;
  level: string;         // Tahun 1, Tahun 6
  topic: string;         // Pendaraban
  standardKandungan: string;
  standardPembelajaran: string; 
  objectives: string;
  date: string;
  duration: string;
  minggu?: string;
  kriteriaKejayaan?: string;
  emk?: string;
  bbm?: string;
  pbd?: string;
}

export interface RPHResponse extends RPH {
  _id: string;
}