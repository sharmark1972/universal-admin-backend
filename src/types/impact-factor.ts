export interface ImpactFactor {
  id: string;
  year: number;
  value: number;
  certificatePath: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creator?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ImpactFactorFormData {
  year: number;
  value: number;
  certificate?: File;
  isActive: boolean;
}