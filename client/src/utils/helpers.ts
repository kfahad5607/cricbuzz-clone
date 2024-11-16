export const debounce = <TFunc extends (...args: any[]) => void>(
  func: TFunc,
  wait: number
) => {
  let timeout: number = -1;

  return (...args: Parameters<TFunc>) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
