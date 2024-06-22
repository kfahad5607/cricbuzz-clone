export const PositiveNumberType = {
  type: Number,
  min: 0,
};

export const DBIdType = {
  type: Number,
  required: true,
  min: 0,
  // immutable: true,
};

export const DBIdUniqueType = {
  ...DBIdType,
  unique: true,
};
