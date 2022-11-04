import { ConvertFileType } from '../enums/convert-file-type.enum';

export interface ConvertFile {
  file: FormData,
  exportFileType: ConvertFileType;
}
