import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// Extend Day.js with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

type TimestampObject = {
  [key: string]: any;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  deleted_at?: Date | string | null;
};

export class DateUtil {
  private static configService: ConfigService;
  private static readonly timestampFields = ['created_at', 'updated_at', 'deleted_at'];
  private static readonly defaultTimezone = 'UTC';
  private static readonly dateFormat = 'YYYY-MM-DD HH:mm:ss';

  static setConfigService(config: ConfigService) {
    this.configService = config;
  }

  private static getTimezone(): string {
    if (this.configService) {
      return this.configService.get('timezone') || this.defaultTimezone;
    }
    return process.env.TZ || this.defaultTimezone;
  }

  static formatTimestamp(date: Date | string | null): string | null {
    if (!date) {
      return null;
    }

    return dayjs(date)
      .tz(this.getTimezone())
      .format(this.dateFormat);
  }

  static formatTimestamps<T extends TimestampObject>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = { ...obj } as T;

    for (const [key, value] of Object.entries(obj)) {
      if (this.timestampFields.includes(key) && value) {
        (result as any)[key] = this.formatTimestamp(value);
      } else if (Array.isArray(value)) {
        (result as any)[key] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? this.formatTimestamps(item)
            : item
        );
      } else if (value && typeof value === 'object') {
        (result as any)[key] = this.formatTimestamps(value);
      }
    }

    return result;
  }

  static now(): string {
    return dayjs()
      .tz(this.getTimezone())
      .format(this.dateFormat);
  }

  static parse(date: string | Date): dayjs.Dayjs {
    return dayjs(date).tz(this.getTimezone());
  }

  static isValid(date: string | Date): boolean {
    return dayjs(date).isValid();
  }
}