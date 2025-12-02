
export interface Address {
  id: string;
  name: string;
  email: string;
  organization: string; // Company/Organization (e.g., 社内, TEST建設)
  department: string;   // Specific Dept (e.g., 営業部, 建築技術部)
}

export interface GroupAttribute {
  key: string;
  value: string;
}

export interface GroupMember {
  id: string;
  recipientType: 'to' | 'cc' | 'bcc';
  order: number;
}

export interface Group {
  id: string;
  group_name: string;
  memberIds: GroupMember[]; // List of members with recipient type and order
  customAttributes?: GroupAttribute[]; // e.g., { key: "現場名", value: "〇〇ビル新築工事" }
}

export interface GlobalVariable {
  id: string;
  key: string;
  value: string;
}

export interface AttributeDefinition {
  id: string;
  key: string;
  label?: string; // Optional description or label
}

export type RecipientType = 'TO' | 'CC' | 'BCC';

export interface TemplateRecipient {
  addressId: string;
  type: RecipientType;
}

export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  defaultRecipients: TemplateRecipient[];
}

// Helper type for the navigation
export enum View {
  COMPOSE = 'COMPOSE',
  ADDRESS_BOOK = 'ADDRESS_BOOK',
  GROUPS = 'GROUPS',
  TEMPLATES = 'TEMPLATES',
  VARIABLES = 'VARIABLES',
  IMPORT = 'IMPORT',
}