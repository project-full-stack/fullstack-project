export interface Resource {
  id: number;
  nameTh: string; 
  nameEn: string; 
  type: 'room' | 'equipment';
  isActive: boolean; 
  description?: string;
}

export type Language = 'th' | 'en';