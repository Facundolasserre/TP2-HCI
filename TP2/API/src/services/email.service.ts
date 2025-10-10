import * as fs from 'fs';
import * as path from 'path';
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { ERROR_MESSAGES } from '../types/errorMessages';
import { ServerError, BadRequestError } from '../types/errors';

const DEFAULT_REGISTRATION_SUBJECT = "Email verification";
const DEFAULT_RESET_PASSWORD_SUBJECT = "Reset Password Verification";
const DEFAULT_PANTRY_SHARED_SUBJECT = "Pantry Shared with You";
const DEFAULT_LIST_SHARED_SUBJECT = "Shopping List Shared with You";

const DEFAULT_REGISTRATION_TEMPLATE = `<div style="text-align: center;">
    <h1>
        <strong>Welcome <%FIRST_NAME%></strong>
    </h1>
    <h3>
        <strong>Your verification code is <span style="color: #fc987e;"><%VERIFICATION_CODE%></span></strong>
    </h3>
</div>`;

const DEFAULT_RESET_PASSWORD_TEMPLATE = `<div style="text-align: center;">
    <h1>
        <strong>Password recovery</strong>
    </h1>
    <p>
        <span>Valid until <%EXPIRATION_DATE%></span>
    </p>
    <h3>
        <strong>Your code is <span style="color: #fc987e;"><%VERIFICATION_CODE%></span></strong>
    </h3>
</div>`;

const DEFAULT_PANTRY_SHARED_TEMPLATE = `<div style="text-align: center;">
    <h1>
        <strong>Pantry Shared with You</strong>
    </h1>
    <p>
        <strong>Hello <%RECIPIENT_NAME%>!</strong>
    </p>
    <p>
        <strong><%OWNER_NAME%></strong> has shared the pantry <strong>"<%PANTRY_NAME%>"</strong> with you.
    </p>
    <p>
        You can now view and manage items in this pantry.
    </p>
</div>`;

const DEFAULT_LIST_SHARED_TEMPLATE = `<div style="text-align: center;">
    <h1>
        <strong>Shopping List Shared with You</strong>
    </h1>
    <p>
        <strong>Hello <%RECIPIENT_NAME%>!</strong>
    </p>
    <p>
        <strong><%OWNER_NAME%></strong> has shared the shopping list <strong>"<%LIST_NAME%>"</strong> with you.
    </p>
    <p>
        You can now view and manage items in this shopping list.
    </p>
</div>`;

export enum EmailType {
  REGISTRATION = 'REGISTRATION',
  RESET_PASSWORD = 'RESET_PASSWORD',
  PANTRY_SHARED = 'PANTRY_SHARED',
  LIST_SHARED = 'LIST_SHARED'
}

export class Mailer {

  private transporter: Transporter;
  private baseEmailOptions: Mail.Options = {
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
  }

  constructor(transporter: Transporter) {
    this.transporter = transporter;
  }

  async sendEmail(type: EmailType, ...params: any) {
    if(!this.transporter) throw new ServerError(ERROR_MESSAGES.SERVER.MAILER_SERVICE_NOT_INITIALIZED);
    switch (type) {
      case EmailType.REGISTRATION:
        await this.sendRegistrationEmail(params[0], params[1]);
        break;
      case EmailType.RESET_PASSWORD:
        await this.sendResetPasswordEmail(params[0], params[1]);
        break;
      case EmailType.PANTRY_SHARED:
        await this.sendPantrySharedEmail(params[0], params[1], params[2]);
        break;
      case EmailType.LIST_SHARED:
        await this.sendListSharedEmail(params[0], params[1], params[2]);
        break;
      default:
        throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID("email type"));
    }
  }

  private async sendRegistrationEmail(firstName: string, verificationCode: string) {
    const subject = process.env.REGISTRATION_SUBJECT || DEFAULT_REGISTRATION_SUBJECT;
    const emailOptions: Mail.Options = {
      ...this.baseEmailOptions,
      subject,
      html: this.getRegistrationEmailTemplate(firstName, verificationCode)
    }
    await this.transporter.sendMail(emailOptions);
  }

  private async sendResetPasswordEmail(token: string, expirationDate: Date): Promise<void> {
    const subject = process.env.RESET_PASSWORD_SUBJECT || DEFAULT_RESET_PASSWORD_SUBJECT;
    const emailOptions: Mail.Options = {
      ...this.baseEmailOptions,
      subject,
      html: this.getResetPasswordEmailTemplate(token, expirationDate)
    }
    await this.transporter.sendMail(emailOptions);
  }

  private async sendPantrySharedEmail(recipientName: string, pantryName: string, ownerName: string): Promise<void> {
    const subject = process.env.PANTRY_SHARED_SUBJECT || DEFAULT_PANTRY_SHARED_SUBJECT;
    const emailOptions: Mail.Options = {
      ...this.baseEmailOptions,
      subject,
      html: this.getPantrySharedEmailTemplate(recipientName, pantryName, ownerName)
    }
    await this.transporter.sendMail(emailOptions);
  }

  private async sendListSharedEmail(recipientName: string, listName: string, ownerName: string): Promise<void> {
    const subject = process.env.LIST_SHARED_SUBJECT || DEFAULT_LIST_SHARED_SUBJECT;
    const emailOptions: Mail.Options = {
      ...this.baseEmailOptions,
      subject,
      html: this.getListSharedEmailTemplate(recipientName, listName, ownerName)
    }
    await this.transporter.sendMail(emailOptions);
  }

  private getRegistrationEmailTemplate(firstName: string, verificationCode: string): string {
    let template = readFileContent("templates/registration.mft");
    if (!template) template = DEFAULT_REGISTRATION_TEMPLATE;

    return template
      .replace(/<%FIRST_NAME%>/g, firstName)
      .replace(/<%VERIFICATION_CODE%>/g, verificationCode);
  }

  private getResetPasswordEmailTemplate(token: string, expirationDate: Date): string {
    let template = readFileContent("templates/reset-password.mft");
    if (!template) template = DEFAULT_RESET_PASSWORD_TEMPLATE;

    return template
      .replace(/<%EXPIRATION_DATE%>/g, expirationDate.toLocaleString())
      .replace(/<%VERIFICATION_CODE%>/g, token);
  }

  private getPantrySharedEmailTemplate(recipientName: string, pantryName: string, ownerName: string): string {
    let template = readFileContent("templates/pantry-shared.mft");
    if (!template) template = DEFAULT_PANTRY_SHARED_TEMPLATE;

    return template
      .replace(/<%RECIPIENT_NAME%>/g, recipientName)
      .replace(/<%PANTRY_NAME%>/g, pantryName)
      .replace(/<%OWNER_NAME%>/g, ownerName);
  }

  private getListSharedEmailTemplate(recipientName: string, listName: string, ownerName: string): string {
    let template = readFileContent("templates/list-shared.mft");
    if (!template) template = DEFAULT_LIST_SHARED_TEMPLATE;

    return template
      .replace(/<%RECIPIENT_NAME%>/g, recipientName)
      .replace(/<%LIST_NAME%>/g, listName)
      .replace(/<%OWNER_NAME%>/g, ownerName);
  }
}

function readFileContent(filePath: string): string | null {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error(`Error reading template file ${filePath}: ${error}`);
    return null;
  }
}