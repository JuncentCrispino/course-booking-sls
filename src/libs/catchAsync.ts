/* eslint-disable prettier/prettier */
type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

export const catchAsync = <T extends any[], R>(fn: AsyncFunction<T, R>) => (...args: T) => {
  return Promise.resolve(fn(...args))
    .catch(err => {
      console.log(err)
      throw err
    })
}
