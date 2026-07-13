// Types for Fee Schedules module (RF-HU-022.1)

export interface FeeSchedule {
  id: string;
  yearId: string;
  yearName: string;
  gradeId: string;
  gradeName: string;
  chargeTypeId: string;
  chargeTypeName: string;
  amount: number;
}

export interface FeeSchedulePayload {
  yearId: string;
  gradeId: string;
  chargeTypeId: string;
  amount: number;
}