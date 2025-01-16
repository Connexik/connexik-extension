export const wait = (time: number) =>
  new Promise((res) => setTimeout(res, time * 1000))

export const capitalizeFirstLetter = (str: string) => {
    if (str.length === 0) return ''; // Handle empty string
    return str.charAt(0).toUpperCase() + str.slice(1);
  }