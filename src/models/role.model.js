const { Schema, model } = require('mongoose');

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = model('Role', roleSchema);
