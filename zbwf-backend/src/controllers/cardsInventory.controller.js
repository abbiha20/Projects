import CardInventory from '../models/cardInventory.model.js';

export const addCard = async (req, res) => {
  try {
    const newCard = await CardInventory.create(req.body);
    res.status(201).json(newCard);
  } catch (err) {
    res.status(400).json({ error:  err.message });
  }
};

export const searchCards = async (req, res) => {
  try {
    const {
      cards,
      dispatch_date,
      hospital_id,
      purpose,
      split_full,
      metabolic_type,
      babies_screened,
      from,
      to
    } = req.query;

    const where = {};
    if (cards) where.cards = cards;
    if (dispatch_date) where.dispatch_date = dispatch_date;
    if (hospital_id) where.hospital_id = hospital_id;
    if (purpose) where.purpose = purpose;
    if (split_full) where.split_full = split_full;
    if (metabolic_type) where.metabolic_type = metabolic_type;
    if (babies_screened) where.babies_screened = babies_screened;
    if (from && to) where.createdAt = { $between: [new Date(from), new Date(to)] };

    const data = await CardInventory.findAll({ where });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
