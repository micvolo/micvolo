/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type SendEmailMessage = {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
};

type SendEmailBinding = {
  send(message: SendEmailMessage): Promise<{ messageId: string }>;
};


declare namespace App {
  interface Locals {
    principal: Principal | null;
  }
}

interface Principal {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'client';
}

interface Env {
  DB: D1Database;
  DOCUMENTS: R2Bucket;
  EMAIL: SendEmailBinding;
  ADMIN_EMAIL: string;
  EMAIL_FROM: string;
  OTP_SECRET: string;
  DEV_OTP_PREVIEW?: string;
  ENVIRONMENT?: string;
}
