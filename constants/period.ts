export const PERIOD = {
  JUNIOR_HIGH: 'JUNIOR_HIGH',
  HIGH_SCHOOL: 'HIGH_SCHOOL',
  UNIVERSITY: 'UNIVERSITY',
} as const;

export type Period = typeof PERIOD[keyof typeof PERIOD];

export const PERIOD_LABEL: Record<Period, string> = {
  [PERIOD.JUNIOR_HIGH]: '中学時代',
  [PERIOD.HIGH_SCHOOL]: '高校時代',
  [PERIOD.UNIVERSITY]: '大学時代',
};

export const PERIOD_ORDER = [
  PERIOD.JUNIOR_HIGH,
  PERIOD.HIGH_SCHOOL,
  PERIOD.UNIVERSITY,
] as const;
