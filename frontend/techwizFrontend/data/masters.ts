export interface LocalMaster {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  category: string;
  isActive: boolean;
}

let masters: LocalMaster[] = [];

export function getMasters(): LocalMaster[] {
  return masters;
}

export function addMaster(master: Omit<LocalMaster, 'id'>) {
  const newMaster: LocalMaster = { ...master, id: Date.now().toString() };
  masters.push(newMaster);
}

export function deleteMaster(id: string) {
  masters = masters.filter(master => master.id !== id);
}

export function updateMaster(id: string, update: Partial<LocalMaster>) {
  masters = masters.map(master => master.id === id ? { ...master, ...update } : master);
} 