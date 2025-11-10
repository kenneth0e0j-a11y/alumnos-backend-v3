const { Schema, model } = require('mongoose');

const permissionSchema = new Schema({
  code: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  module: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = model('Permission', permissionSchema);
