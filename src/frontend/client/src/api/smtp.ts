import { createCrudApi } from "./crud";
import type { SmtpApi, SmtpPayload} from "./types";

export const smtpApi = createCrudApi<SmtpApi, SmtpPayload>("/config/smtp");