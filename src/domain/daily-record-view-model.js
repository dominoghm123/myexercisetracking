import {
  dailyRecordFixture,
  exerciseCategoriesFixture,
} from '../fixtures/daily-record-2026-08-06.js';
import { normalizeDailyRecord } from './normalize-daily-record.js';

export const dailyRecordViewModel = Object.freeze(
  normalizeDailyRecord(dailyRecordFixture, exerciseCategoriesFixture),
);

