export default function createUniqueId(type) {
  const randomNum = Math.floor(Math.random() * 1000000); // Adjust the range as needed
  const uniqueId = `${type}${randomNum}`;
  return uniqueId;
}
