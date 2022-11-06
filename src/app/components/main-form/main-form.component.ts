import { Subject } from 'rxjs';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Buffer } from 'buffer';
// @ts-ignore
import ASN1 from '@lapo/asn1js';
// @ts-ignore
import Hex from '@lapo/asn1js/hex';

import { ConvertFile } from '../../models/backend.models';
import { ConvertFileType } from '../../enums/convert-file-type.enum';
import { DigitalSignature } from '../utils/digital-signature.service';
import { UtilsService } from '../utils/utils.service';


const MB = 1000_000_000;
const VALID_FILE_EXTENSIONS = [ 'exe' ];

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: [ './main-form.component.scss' ]
})
export class MainFormComponent implements OnInit, OnDestroy {

  private readonly uns$: Subject<void> = new Subject<void>();

  form!: FormGroup;
  validFile: boolean = true;
  tempFile!: File | null;
  exportFileTypes: typeof ConvertFileType = ConvertFileType;
  isSuccessConverted: boolean = false;
  isFetching: boolean = false;

  @Input() errorText$!: Subject<string>;
  @Input() isValidFile$!: Subject<boolean>;


  get file(): File {
    return this.form.get('file')?.value;
  }

  get fileControl(): FormControl {
    return this.form.get('file') as FormControl;
  }

  get exportFileType(): string {
    return this.form.get('exportFileType')?.value;
  }

  get exportFileTypeControl(): FormControl {
    return this.form.get('exportFileType')! as FormControl;
  }

  get fileSizeMB(): string {
    return ((this.file?.size / 1024) / 1024).toFixed(1);
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly digitalSignature: DigitalSignature,
    private readonly utilsService: UtilsService
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.isValidFile$
      .subscribe(v=> {
        console.log(v);
        this.validFile = v;
      })
  }

  ngOnDestroy(): void {
    this.uns$.next();
    this.uns$.complete();
  }

  onFileDropped(files: any) {
    this.prepareFile(files);
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    this.prepareFile(fileList);
  }

  convertFile(): void {

    this.isFetching = true;

    const req: ConvertFile = {} as ConvertFile;

    const formData = new FormData()
    formData.append('file', this.file);

    req.file = formData;
    req.exportFileType = this.exportFileType as ConvertFileType;

    this.sendRequest(req);
  }

  prepareFile(fileList: FileList | null): void {

    this.tempFile = fileList![0];

    if (!this.isCorrectFileSize(this.tempFile) || !this.isCorrectFileExt(this.tempFile)) {
      this.validFile = false;
      this.errorText$.next(`The file ${ this.tempFile.name } is too large or have wrong extension!`)
      return;
    }

    this.fileControl?.setValue(fileList![0]);

    this.validFile = true;

  }

  closeErrorHandler(): void {
    this.validFile = true;
    this.fileControl?.setValue(null);
  }

  onSuccessMessageClose(): void {
    this.validFile = true;
    this.tempFile = null;
    this.fileControl?.setValue(null);
    this.isSuccessConverted = false;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      file: [ null, Validators.required ],
      exportFileType: [ '', Validators.required ],
    });
  }

  private sendRequest(req?: ConvertFile): void {

    const fr = new FileReader();

    this.isFetching = true;

    let chunk;

    if (this.file.size > 8096) {
      chunk = this.file.slice(0, 8096);
    }

    fr.readAsArrayBuffer(chunk || this.file);

    fr.onloadend = () => {

      try {
        const { offset, size } = this.digitalSignature.getInfo(fr.result as ArrayBuffer);

        const c = this.file.slice(offset);

        if (this.file.size > 8096) {

          fr.readAsArrayBuffer(c);
          fr.onloadend = () => {
            this.createFile(fr);
          }

        } else {
          this.createFile(fr);
        }
      } catch (e: any) {

        this.validFile = false;
        this.isFetching = false;
        this.isSuccessConverted = false;
        this.tempFile = null;
        this.fileControl.setValue(null);

        this.errorText$.next(`Parsing Error: ${e.message}`);
      }
    }

  }

  private createFile(fr: FileReader) {
    const signatureBuffer = Buffer.from(fr.result as ArrayBuffer);

    switch (this.exportFileType) {
      case ConvertFileType.DER:
        let decoded = ASN1.decode(signatureBuffer, 0);
        let res = this.utilsService.createFormattedStringFromASN1(decoded, null, '');
        this.downloadConvertedFile(res, 'txt');
        break;

      case ConvertFileType.BINARY:
        this.downloadConvertedFile(signatureBuffer, 'p7b');
        break;
    }

    this.isFetching = false;
    this.isSuccessConverted = true;
    this.tempFile = null;
  }

  private downloadConvertedFile(fileDate: any, fileExt: 'txt' | 'p7b'): void {
    const url = window.URL.createObjectURL(new Blob([ fileDate ]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test.${ fileExt }`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  private isCorrectFileExt(file: File): boolean {
    const ext: string = file.name.split('.')!.pop()!.toLowerCase();
    return VALID_FILE_EXTENSIONS.includes(ext);
  }

  private isCorrectFileSize(file: File): boolean {
    return (file.size / MB) < 10;
  }
}
