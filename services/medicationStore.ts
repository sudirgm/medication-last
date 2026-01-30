
import { Medication } from "../types";

const STORAGE_KEY = 'medremind_meds';

export const saveMedications = (meds: Medication[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
};

export const getMedications = (): Medication[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
