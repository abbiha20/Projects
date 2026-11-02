import Kit from '../models/kit.model.js';


export const addKit = async (req, res) => {
  try {
    const newKit = await Kit.create(req.body);
    res.status(201).json(newKit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const updateKit = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Kit.update(req.body, {
      where: { kit_id: id },
    });

    if (updated) {
      const updatedKit = await Kit.findByPk(id);
      res.json(updatedKit);
    } else {
      res.status(404).json({ error: 'Kit not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search Kits
export const searchKits = async (req, res) => {
  try {
    const {
      lot_number,
      kit_number,
      receiving_date,
      opening_date,
      closing_date,
      expiry_date,
      from,
      to,
    } = req.query;

    const where = {};
    if (lot_number) where.lot_number = lot_number;
    if (kit_number) where.kit_number = kit_number;
    if (receiving_date) where.receiving_date = receiving_date;
    if (opening_date) where.opening_date = opening_date;
    if (closing_date) where.closing_date = closing_date;
    if (expiry_date) where.expiry_date = expiry_date;
    if (from && to) where.created_at = { $between: [new Date(from), new Date(to)] };

    const data = await Kit.findAll({ where });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
