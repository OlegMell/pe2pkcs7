import { Injectable } from '@angular/core';

const IMAGE_DOS_SIGNATURE = 0x5A4D;
const IMAGE_NT_SIGNATURE = 0x00004550;
const X32_IMAGE_NT_OPTIONAL_HDR32_MAGIC = 0x10b;
const X64_IMAGE_NT_OPTIONAL_HDR64_MAGIC = 0x20b;
const ATTRIBUTE_CERTIFICATE_HEADER_SIZE = 8;

@Injectable({ providedIn: 'root' })
export class DigitalSignature {

  private data: any;

  _dataAsDataViewReadonly(data: any) {
    if (data instanceof DataView) {
      return data;
    } else if (data instanceof ArrayBuffer) {
      return new DataView(data);
    } else if (data instanceof Uint8Array) {
      return new DataView(data.buffer);
    } else if (data instanceof Buffer) {
      return new DataView(data.buffer, data.byteOffset, data.byteLength);
    } else {
      throw new Error('Invalid data type');
    }
  }

  _dataAsDataView(data: any) {
    return this._dataAsDataViewReadonly(data);
  }


  _getNtHeader() {
    if (this.data.getUint16(0, true) !== IMAGE_DOS_SIGNATURE) {
      throw new Error('Invalid DOS signature');
    }

    // Get the offset of the NT header
    const offsetNtHeader = this.data.getUint32(60, true);

    // Check if the NT header is valid
    if (this.data.getUint32(offsetNtHeader, true) !== IMAGE_NT_SIGNATURE) {
      throw new Error('Invalid NT header');
    }

    return offsetNtHeader;
  }

  _getOptionalHeader(offsetNtHeader: any) {
    return offsetNtHeader + 24;
  }

  _getRvaCountOffset(optionalHeaderOffset: any) {
    // Get the magic number of the optional header
    const magic = this.data.getUint16(optionalHeaderOffset, true);

    // Check if the optional header is 32-bit or 64-bit
    if (magic === X32_IMAGE_NT_OPTIONAL_HDR32_MAGIC) {
      // 32-bit
      return optionalHeaderOffset + 92;
    } else if (magic === X64_IMAGE_NT_OPTIONAL_HDR64_MAGIC) {
      // 64-bit
      return optionalHeaderOffset + 108;
    }
    throw new Error('Invalid optional header');
  }


  _checkIfRvaCountIsValid(validOptionalHeader: any) {
    const rvaCount = this.data.getUint32(validOptionalHeader, true);
    if (rvaCount < 5) {
      throw new Error('No PE security field');
    }
  }

  _checkIfSectionCountIsValid(ntHeader: any) {
    // get FileHeader from NT header
    const fileHeader = ntHeader + 4;
    // get NumberOfSections from FileHeader
    const numberOfSectionsAddr = fileHeader + 2;

    // Get the number of sections
    const numberOfSections = this.data.getUint16(numberOfSectionsAddr, true);

    if (numberOfSections < 1) {
      throw new Error('No sections');
    }
  }

  _getSecurityDirectory(validOptionalHeader: any) {

    return validOptionalHeader + 4 + 4 * 8;

  }

  getInfo(data: any) {

    this.data = this._dataAsDataView(data);

    let ntHeader = this._getNtHeader();
    this._checkIfSectionCountIsValid(ntHeader);

    let optionalHeader = this._getOptionalHeader(ntHeader);
    let rvaCountOffset = this._getRvaCountOffset(optionalHeader);
    this._checkIfRvaCountIsValid(rvaCountOffset);

    const securityDirectory = this._getSecurityDirectory(rvaCountOffset);

    // Get virtual address of security directory
    const virtualAddressOfSecurityDirectory = this.data.getUint32(securityDirectory, true);

    // Get size of security directory
    const size = this.data.getUint32(securityDirectory + 4, true);

    if (!size) {
      throw new Error('File without digital signature!');
    }

    const digitalSignature = virtualAddressOfSecurityDirectory + ATTRIBUTE_CERTIFICATE_HEADER_SIZE;
    const digitalSignatureSize = size - ATTRIBUTE_CERTIFICATE_HEADER_SIZE;

    return { offset: digitalSignature, size: digitalSignatureSize };
  }
}
