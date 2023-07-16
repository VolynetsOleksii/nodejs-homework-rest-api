import express from "express";
import contactsService from "../../models/contacts.js";
import { HttpError } from "../../helpers/index.js";

const contactsRouter = express.Router();

contactsRouter.get("/", async (req, res, next) => {
  try {
    const result = await contactsService.listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

contactsRouter.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactsService.getContactById(contactId);
    if (!result) {
      throw HttpError(404, `Contact with id=${contactId} not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

contactsRouter.post("/", async (req, res, next) => {
  try {
    const result = await contactsService.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

contactsRouter.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactsService.removeContact(contactId);
    if (!result) {
      throw HttpError(404, `Contact with id=${contactId} not found`);
    }
  res.json({ message: "Delete success" });
  } catch (error) {
    next(error);
  }
});

contactsRouter.put("/:contactId", async (req, res, next) => {
try {
  const { contactId } = req.params;
  const result = await contactsService.updateContact(contactId, req.body);
   if (!result) {
      throw HttpError(404, `Contact with id=${contactId} not found`);
    }
  res.status(201).json(result);
} catch (error) {
  next(error);
}
});

export default contactsRouter;
