export interface Resource {
  id: number;
  name: string;
  type: 'room' | 'equipment';
  is_active: boolean;
  description?: string;
}

export type Language = 'th' | 'en';