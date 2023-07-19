import contactsService from "../models/contacts.js";
import { HttpError } from "../helpers/index.js";
import {ctrlWrapper} from "../decorators/index.js";



const getAll = async (req, res, next) => {
    const result = await contactsService.listContacts();
    res.json(result);
};

const getById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await contactsService.getContactById(contactId);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.json(result);
};

const add = async (req, res, next) => {
    const result = await contactsService.addContact(req.body);
    res.status(201).json(result);
};

const deleteById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await contactsService.removeContact(contactId);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.json({ message: "contact deleted" });
};

const updateById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await contactsService.updateContact(contactId, req.body);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(result);
};

export default {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
};
