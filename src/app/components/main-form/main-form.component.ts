import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { BackendService } from '../../services/backend.service';
import { retry, Subject, takeUntil } from 'rxjs';
import { ConvertFile } from '../../models/backend.models';
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

  @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();

  dragAreaClass!: string;
  form!: FormGroup;
  validFile!: boolean;

  exportFileTypes: typeof ConvertFileType = ConvertFileType;

  get file(): File {
    return this.form.get('file')?.value;
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

  /**
   * on file drop handler
   */
  onFileDropped(files: any) {
    this.prepareFile(files);
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    this.prepareFile(fileList);
  }

  convertFile(): void {
    this.isLoading.emit(true);

    const req: ConvertFile = {} as ConvertFile;

    const formData = new FormData()
    formData.append('file', this.file);

    req.file = formData;
    req.exportFileType = this.exportFileType as ConvertFileType;

    console.log(req);

    this.sendRequest(req);
  }

  prepareFile(fileList: FileList | null): void {
    if (!this.isCorrectFileSize(fileList![0]) || this.isCorrectFileExt(fileList![0])) {
      return;
    }

    this.form.get('file')?.setValue(fileList![0]);

    this.validFile = true;
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
        console.log(res);
      });
  }

  private isCorrectFileExt(file: File): boolean {
    const ext: string = file.name.split('.')!.pop()!.toLowerCase();
    return VALID_FILE_EXTENSIONS.includes(ext);
  }

  private isCorrectFileSize(file: File): boolean {
    return (file.size / MB) < 10;
  }

}
