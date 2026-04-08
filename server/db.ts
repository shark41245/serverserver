
let users = [];

export async function createUser(data) {
  users.push(data);
}

export async function findUser(userId) {
  return users.find(u => u.userId === userId);
}

export async function getAllUsers() {
  return users;
}
