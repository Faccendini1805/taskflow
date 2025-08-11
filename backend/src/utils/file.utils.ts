import fs from 'fs';
import path from 'path';

/**
 * Guarda un archivo en el disco asegurando que exista el directorio.
 * @param dir Directorio destino
 * @param fileName Nombre del archivo
 * @param buffer Contenido (Buffer)
 */
export function saveFile(dir: string, fileName: string, buffer: Buffer): string {
  fs.mkdirSync(dir, { recursive: true });
  const fullPath = path.join(dir, fileName);
  fs.writeFileSync(fullPath, buffer);
  return fullPath;
}

/**
 * Elimina un archivo si existe
 */
export function deleteFile(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/**
 * Valida extensión de archivo contra una lista blanca
 */
export function validateFileExtension(fileName: string, allowedExt: string[]): boolean {
  const ext = path.extname(fileName).toLowerCase().replace('.', '');
  return allowedExt.includes(ext);
}

/**
 * Convierte tamaño en bytes a formato legible
 */
export function humanFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}
