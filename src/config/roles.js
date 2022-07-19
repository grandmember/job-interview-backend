const allRoles = {
  user: ['getAdditionalServices', 'bookAdditionalServices'],
  admin: ['getUsers', 'manageUsers', 'getAdditionalServices', 'manageAdditionalServices'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
