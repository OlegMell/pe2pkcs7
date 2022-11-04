import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConvertFile } from '../models/backend.models';

@Injectable({ providedIn: 'root' })
export class BackendService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  // TODO set method url
  convertFile(req: ConvertFile): Observable<any> {
    return this.http.post<any>(`path?ext=${req.exportFileType}`, req.file);
  }

}
