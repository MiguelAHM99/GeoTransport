export interface RutaI {
  id: string;
  nombre: string;
  descripcion: string;
  inicio: string;
  destino: string;
  paraderos: ParaderoI[]; // Asegúrate de que la interfaz RutaI incluya esta propiedad
}

export interface ParaderoI {
  id: string;
  lat: number;
  lng: number;
  nombre: string;
}