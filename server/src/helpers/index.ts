export const isObjEmpty = (obj: Record<PropertyKey, unknown>) => {
  return Object.keys(obj).length === 0;
};
