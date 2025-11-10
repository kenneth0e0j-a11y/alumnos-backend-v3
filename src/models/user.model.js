const { Schema, model, Types } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  roles: [{ type: Types.ObjectId, ref: 'Role' }],   // relación a roles
  legacyRoles: { type: [String], default: [] },     // opcional compatibilidad
}, { timestamps: true });

userSchema.virtual('password')
  .set(function (plain) {
    this._password = plain;
    this.passwordHash = bcrypt.hashSync(plain, 10);
  });

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = model('User', userSchema);
