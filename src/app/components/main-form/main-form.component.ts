import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { ConvertFile } from '../../models/backend.models';
import { BackendService } from '../../services/backend.service';
import { ConvertFileType } from '../../enums/convert-file-type.enum';

const MB = 1000_000;
const VALID_FILE_EXTENSIONS = [ 'exe' ];

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: [ './main-form.component.scss' ]
})
export class MainFormComponent implements OnInit, OnDestroy {

  private readonly uns$: Subject<void> = new Subject<void>();

  // @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    private readonly backendService: BackendService,
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
    // this.isLoading.emit(true);

    this.isFetching = true;

    const req: ConvertFile = {} as ConvertFile;

    const formData = new FormData()
    formData.append('file', this.file);

    req.file = formData;
    req.exportFileType = this.exportFileType as ConvertFileType;

    console.log(req);

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

  private sendRequest(req: ConvertFile): void {
    this.backendService.convertFile(req)
      .pipe(takeUntil(this.uns$))
      .subscribe((res) => {

        console.log('DATA: ', res);
        // this.downloadConvertedFile(res.data);

        this.isFetching = false;
        this.isSuccessConverted = true;
        this.tempFile = null;
        this.fileControl.setValue(null);
      });
  }

  private downloadConvertedFile(fileDate: any): void {
    const url = window.URL.createObjectURL(new Blob([ fileDate ]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', this.file.name);
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
