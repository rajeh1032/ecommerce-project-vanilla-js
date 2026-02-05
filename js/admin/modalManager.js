import { openModal, closeModal } from "./utils.js";
//  MODAL STATE 
export let currentEditId = null;
export let currentEditType = null;

export function setEditState(id, type) {
  currentEditId = id;
  currentEditType = type;
}
export function clearEditState() {
  currentEditId = null;
  currentEditType = null;
}
//  MODAL ELEMENTS 
export const modals = {
  editUser: document.getElementById("editUserModal"),
  category: document.getElementById("categoryModal"),
  product: document.getElementById("productModal"),
  order: document.getElementById("orderModal"),
};
export const modalTitles = {
  category: document.getElementById("categoryModalTitle"),
  product: document.getElementById("productModalTitle"),
  order: document.getElementById("orderModalTitle"),
};
//  MODAL WRAPPER FUNCTIONS 
export function openEditModal(modal) {
  openModal(modal);
}
export function closeEditModal(modal) {
  closeModal(modal);
  clearEditState();
}
