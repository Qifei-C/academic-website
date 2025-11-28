export type Slot = { time: string; available?: boolean };

export type AvailabilityDay = {
  date: string; // yyyy-MM-dd
  label?: string;
  slots: Slot[];
};

export type MockEventInput = {
  name: string;
  email: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm–HH:mm
};

export type MockEventResult = {
  summary: string;
  start: string;
  end: string;
  description?: string;
  attendee?: string;
};
