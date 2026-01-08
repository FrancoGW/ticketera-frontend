import api from "../config/axios.config";

/**
 * Authentication functions
 */
const login = (email, password) => {
  return api.post("/auth/login", { email, password });
};

const createUser = (userData) => {
  return api.post("/auth/registerForUser", {
    firstname: userData.firstname,
    lastname: userData.lastname,
    email: userData.email,
    password: userData.password,
    dni: userData.dni,
    phoneNumber: userData.phoneNumber,
  });
};

const getProfile = () => {
  return api.get("/auth/check-status");
};


/**
 * Password management
 */
// const recoverPassword = (email) => {
//   return api.post("/auth/password-reset", { email });
// };

// const requireUpdatePassword = () => {
//   return api.put("/users/update-password");
// };

// const updatePassword = (newPassword, token) => {
//   return api.post(`/users/update-password?token=${token}`, { newPassword });
// };

//!!!!!!!!!!!!!!!!!!!!!!!!
const recoverPassword = (email) => {
  return api.post("/auth/password-reset", { email });
};

const verifyResetCode = () => {
  return api.post("/auth/password-reset/verify");
};

const updatePassword = (newPassword, token) => {
  return api.post("/auth/password-reset/confirm", { newPassword,token });
};

//!!!!!!!!!!!!!!!!!!!!!!!!


/**
 * User management - Basic user functions
 */
const update = (firstname, lastname, phoneNumber, dni) => {
  return api.put("/users/update-info", {
    firstname,
    lastname,
    phoneNumber,
    dni,
  });
};

const requireResetEmail = () => {
  return api.post("/auth/require-update-email");
};

/**
 * Admin CRUD Operations
 */
const getAllUsers = () => {
  return api.get("/users");
};

const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

const updateTotal = (id, userData) => {
  const updatedData = {
    firstname: userData.firstname,
    lastname: userData.lastname,
    email: userData.email,
    password: userData.password,
    phoneNumber: userData.phoneNumber,
    dni: userData.dni,
    isVerified: userData.isVerified,
    roles: userData.roles[0] // Enviamos el primer rol como string
  };

  // Eliminamos campos undefined o null
  Object.keys(updatedData).forEach(key => 
    (updatedData[key] === undefined || updatedData[key] === null) && delete updatedData[key]
  );

  return api.put(`/users/update-total/${id}`, updatedData);
};

/**
 * Contact and Communication
 */
const sendContactEmail = ({ email, name, message }) => {
  return api.post("/auth/send-contact-email", { email, name, message });
};

const userApi = {
  // Authentication
  login,
  createUser,
  getProfile,

  // Password Management
  recoverPassword,
  verifyResetCode,
  updatePassword,

  // User Management
  update,
  requireResetEmail,

  // Admin CRUD Operations
  getAllUsers,
  getUserById,
  deleteUser,
  updateTotal,

  // Contact
  sendContactEmail,
};

export default userApi;