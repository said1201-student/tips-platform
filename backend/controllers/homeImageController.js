const homeImageModel = require("../models/homeImageModel");
const ApiError = require("../utils/ApiError");

const IMAGE_DATA_URL_RE = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i;

function normalizeImage(value) {
  if (typeof value !== "string" || value.length > 6000000 || !IMAGE_DATA_URL_RE.test(value)) {
    throw new ApiError(422, "Image must be a valid image (PNG/JPG/WebP/GIF, max 4 MB).");
  }
  return value;
}

function toInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

async function listPublic(req, res, next) {
  try {
    const images = await homeImageModel.list({ activeOnly: true });
    res.json({ images });
  } catch (err) {
    next(err);
  }
}

async function adminList(req, res, next) {
  try {
    const images = await homeImageModel.list();
    res.json({ images });
  } catch (err) {
    next(err);
  }
}

async function adminCreate(req, res, next) {
  try {
    const { title, image, link, sortOrder, active } = req.body;
    if (!image) throw new ApiError(422, "Please choose an image.");

    const created = await homeImageModel.create({
      title: title ? String(title).trim() : null,
      image: normalizeImage(image),
      link: link ? String(link).trim() : null,
      sortOrder: toInt(sortOrder),
      active: active === undefined ? 1 : active ? 1 : 0,
    });

    res.status(201).json({ message: "Home image added.", image: created });
  } catch (err) {
    next(err);
  }
}

async function adminUpdate(req, res, next) {
  try {
    const img = await homeImageModel.findById(req.params.id);
    if (!img) throw new ApiError(404, "Home image not found.");

    const { title, image, link, sortOrder, active } = req.body;
    const fields = {};
    if (title !== undefined) fields.title = title ? String(title).trim() : null;
    if (image !== undefined) fields.image = normalizeImage(image);
    if (link !== undefined) fields.link = link ? String(link).trim() : null;
    if (sortOrder !== undefined) fields.sort_order = toInt(sortOrder);
    if (active !== undefined) fields.active = active ? 1 : 0;

    const updated = await homeImageModel.update(img.id, fields);
    res.json({ message: "Home image updated.", image: updated });
  } catch (err) {
    next(err);
  }
}

async function adminDelete(req, res, next) {
  try {
    const img = await homeImageModel.findById(req.params.id);
    if (!img) throw new ApiError(404, "Home image not found.");
    await homeImageModel.remove(img.id);
    res.json({ message: "Home image deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublic, adminList, adminCreate, adminUpdate, adminDelete };