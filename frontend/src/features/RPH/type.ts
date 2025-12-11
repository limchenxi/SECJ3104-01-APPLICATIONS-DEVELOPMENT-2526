export interface RPH {
  _id?: string;
  subject: string;
  level: string;
  topic: string;
  objectives: string;
  duration?: string;
  materials?: string;

  // AI generated result
  title: string;
  date: string;
  sections: Array<{
    title: string;
    content: string;
  }>;

  createdAt?: string;
}

export interface RPHRequest {
  subject: string;
  level: string;         // Tahun 1, Tahun 6
  topic: string;         // Pendaraban
  objectives: string;
  duration?: string;     // optional
  materials?: string;    // optional
}

export interface RPHResponse {
  title: string;
  date: string;
  duration: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  generatedAt: string;
}