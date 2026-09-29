export interface Resource {
  id: number;
  name: string;
  type: 'room' | 'equipment';
  isActive: boolean; 
  description?: string;
}

export type Language = 'th' | 'en';