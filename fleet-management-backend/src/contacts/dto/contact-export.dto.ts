// contact-export.dto.ts
export class ContactExportDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  originalSource?: string;
  block?: boolean;
}
