import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { signatureGet } from 'portable-executable-signature';
import { Buffer } from 'buffer';
// @ts-ignore
import ASN1 from '@lapo/asn1js';
// @ts-ignore
import Hex from '@lapo/asn1js/hex';

import { ConvertFile } from '../../models/backend.models';
import { BackendService } from '../../services/backend.service';
import { ConvertFileType } from '../../enums/convert-file-type.enum';


const MB = 2000_000;
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

  constructor(
    private readonly formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
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

    fr.readAsArrayBuffer(this.file);

    fr.onloadend = () => {

      const signature = signatureGet(fr.result as ArrayBuffer);

      const signatureBuffer = Buffer.from(signature as ArrayBuffer, 8);

      switch (this.exportFileType) {
        case ConvertFileType.DER:
          let decoded = ASN1.decode(signatureBuffer, 0);
          let res = this.print(decoded, null, '');
          this.downloadConvertedFile(res, 'txt');
          break;

        case ConvertFileType.BINARY:
          this.downloadConvertedFile(signatureBuffer, 'p7b');
          break;
      }
    }


    this.isFetching = false;
    this.isSuccessConverted = true;
    this.tempFile = null;
    // this.fileControl.setValue(null);
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

  translate(def: any) {
    if (def?.type?.type)
      def = def.type;
    while (def?.type == 'defined') {
      const name = def.name;
    }
    return def ?? {};
  }

  print(value: any, def: any, indent: any) {

    if (indent === undefined) indent = '';

    let deftype = this.translate(def);
    let tn = value.typeName();

    if (deftype.name == 'CHOICE') {
      for (let c of deftype.content) {
        c = this.translate(c);
        if (tn == c.name) {
          deftype = this.translate(c);
          break;
        }
      }
    }
    if (tn.replaceAll('', ' ') != deftype.name && deftype.name != 'ANY')
      def = null;
    let name = '';
    if (def) {

      if (def.type == 'defined') name = (name ? name + ' ' : '') + def.name;
      if (name) name += ' ';
    }
    let s = indent + name + value.typeName();

    let content = value.content();
    if (content)
      s += ": " + content.replace(/\n/g, '|');
    s += "\n";
    if (value.sub !== null) {
      indent += '  ';
      let j = deftype?.content ? 0 : -1;
      for (let i = 0, max = value.sub.length; i < max; ++i) {
        const subval = value.sub[i];
        let type;
        if (j >= 0) {
          if (deftype?.typeOf)
            type = deftype.content[0];
          else {
            let tn = subval.typeName().replaceAll('', ' ');
            do {
              type = deftype.content[j++];
            } while (('optional' in type || 'default' in type) && type.name != tn);
          }
        }
        s += this.print(subval, type, indent);
      }
    }
    return s;
  }

  private isCorrectFileExt(file: File): boolean {
    const ext: string = file.name.split('.')!.pop()!.toLowerCase();
    return VALID_FILE_EXTENSIONS.includes(ext);
  }

  private isCorrectFileSize(file: File): boolean {
    return (file.size / MB) < 10;
  }
}
