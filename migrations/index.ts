import * as migration_20260525_180532_init_payload_schema from './20260525_180532_init_payload_schema';

export const migrations = [
  {
    up: migration_20260525_180532_init_payload_schema.up,
    down: migration_20260525_180532_init_payload_schema.down,
    name: '20260525_180532_init_payload_schema'
  },
];
